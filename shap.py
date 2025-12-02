import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import importlib, sys as _sys, os as _os
# 解决文件名 shap.py 与第三方包 shap 同名造成的导入冲突
_shap = None
try:
    _here = _os.path.abspath(_os.path.dirname(__file__))
    if _sys.path and _os.path.abspath(_sys.path[0]) == _here:
        _sys.path.pop(0)
    _shap = importlib.import_module("shap")
finally:
    if _here not in _sys.path:
        _sys.path.insert(0, _here)
shap = _shap
try:
    import xgboost as xgb
except Exception:
    xgb = None
try:
    import lightgbm as lgb
except Exception:
    lgb = None
import warnings
import os

# --- 导入Scikit-learn相关库 ---
from sklearn.model_selection import cross_val_score, LeaveOneOut, KFold
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, mean_absolute_percentage_error
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, VotingRegressor, StackingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from scipy.stats import pearsonr, spearmanr
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

# --- 全局配置 ---
# 设置随机种子，保证每次运行结果一致
np.random.seed(42)
warnings.filterwarnings('ignore') # 忽略警告，保持输出整洁

# 配置matplotlib显示中文 (根据你的系统可能需要调整字体)
# Windows通常使用 'Microsoft YaHei' 或 'SimHei'
# Mac通常使用 'Arial Unicode MS'
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei'] 
plt.rcParams['axes.unicode_minus'] = False # 解决负号显示问题
plt.style.use('seaborn-v0_8-whitegrid') # 设置图表风格

# ==========================================
# 0. 模拟数据生成器 (为了让你能直接运行代码)
# ==========================================
def generate_dummy_data(filename='training_dataset1.xlsx'):
    """生成一个模拟的回归数据集，用于测试代码"""
    print(f"正在生成模拟数据文件: {filename} ...")
    n_samples = 200
    # 生成5个特征
    X = np.random.rand(n_samples, 5) * 10
    # 生成目标变量 (模拟熔点 Tm)，加入一些非线性关系和噪声
    # y = 3*x0 + 2*x1^2 + x2*x3 + 噪音
    y = 3 * X[:, 0] + 0.5 * (X[:, 1]**2) + X[:, 2] * X[:, 3] + np.random.normal(0, 2, n_samples) + 2000
    
    df = pd.DataFrame(X, columns=[f'Feature_{i}' for i in ['A', 'B', 'C', 'D', 'E']])
    # 添加两列无关列模拟原数据结构
    df.insert(0, 'Systems', ['Sys']*n_samples)
    df.insert(1, 'Tm', range(n_samples)) # 占位
    df['Tm of MD (K)'] = y
    
    df.to_excel(filename, index=False)
    print("模拟数据生成完毕！")
    return filename

# ==========================================
# 1. 数据加载与验证
# ==========================================
def load_and_validate_data(filepath):
    """读取Excel文件并进行基础检查"""
    try:
        data = pd.read_excel(filepath)
        print("\n" + "="*60)
        print("1. 数据集基本信息")
        print("="*60)
        print(f"样本数量: {len(data)}")
        # 假设前两列是ID或描述，从第3列开始是特征，最后一列可能是目标
        # 根据原文章逻辑：特征在中间，目标变量是 'Tm of MD (K)'
        target_col = 'Tm of MD (K)'
        
        # 简单清洗：填充缺失值
        if data.isnull().sum().any():
            print("检测到缺失值，正在使用均值填充...")
            data = data.fillna(data.mean(numeric_only=True))
        
        # 删除重复值
        if data.duplicated().sum() > 0:
            print(f"删除 {data.duplicated().sum()} 条重复数据")
            data = data.drop_duplicates()
            
        return data
    except Exception as e:
        print(f"读取数据失败: {e}")
        return None

# ==========================================
# 2. 增强的探索性数据分析 (EDA)
# ==========================================
def enhanced_eda(data):
    """绘制目标变量分布和相关性热图"""
    print("\n执行 EDA (探索性数据分析)...")
    target_col = 'Tm of MD (K)'
    
    # 1. 目标变量分布图
    plt.figure(figsize=(10, 6))
    sns.histplot(data[target_col], kde=True, color='steelblue')
    plt.title('目标变量 (熔点) 分布')
    plt.xlabel('Tm (K)')
    plt.show()
    
    # 2. 特征相关性热图 (只取数值列)
    numeric_data = data.select_dtypes(include=[np.number])
    plt.figure(figsize=(10, 8))
    sns.heatmap(numeric_data.corr(), annot=True, fmt='.2f', cmap='coolwarm', square=True)
    plt.title('特征相关性热图')
    plt.show()

# ==========================================
# 3. 高级特征工程
# ==========================================
def advanced_feature_engineering(data):
    """
    创建交互特征、多项式特征和统计特征。
    这是提升模型精度的关键步骤。
    """
    print("\n执行高级特征工程...")
    # 假设前两列是无关信息，从第3列开始到倒数第2列是特征
    # 最后一列是目标 'Tm of MD (K)'
    target_col = 'Tm of MD (K)'
    
    # 提取原始特征 (X) 和 目标 (y)
    # 根据你的数据结构调整切片，这里假设除去最后1列和前2列都是特征
    feature_cols = [c for c in data.columns if c not in ['Systems', 'Tm', target_col]]
    X = data[feature_cols].values
    y = data[target_col].values
    feature_names = feature_cols
    
    # --- 1. 创建交互特征 (例如 A*B) ---
    # 为了演示，我们只对相关性最高的2个特征做交互
    # 实际项目中可以遍历所有特征对
    correlations = [abs(pearsonr(data[col], y)[0]) for col in feature_names]
    top_indices = np.argsort(correlations)[-2:] # 取相关性最高的2个
    
    interaction_features = []
    interaction_names = []
    
    for i in top_indices:
        for j in top_indices:
            if i <= j: # 避免重复和自身相乘
                new_feat = X[:, i] * X[:, j]
                interaction_features.append(new_feat)
                interaction_names.append(f"{feature_names[i]}*{feature_names[j]}")

    # --- 2. 合并所有特征 ---
    if interaction_features:
        X_extended = np.column_stack([X] + interaction_features)
        extended_names = feature_names + interaction_names
    else:
        X_extended = X
        extended_names = feature_names
        
    print(f"原始特征数: {len(feature_names)}")
    print(f"扩展后特征数: {len(extended_names)}")
    
    return X_extended, y, extended_names

# ==========================================
# 4. 优化的模型训练与集成学习
# ==========================================
def optimized_model_training(X, y, feature_names):
    """
    训练多种模型，并使用 Voting 和 Stacking 进行集成。
    """
    print("\n" + "="*60)
    print("4. 模型训练与评估")
    print("="*60)
    
    # 数据标准化：对异常值鲁棒的缩放器
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 定义基础模型库
    models = {
        'Ridge': Ridge(random_state=42),
        'Lasso': Lasso(random_state=42),
        'SVR': SVR(kernel='rbf'),
        'GBR': GradientBoostingRegressor(n_estimators=100, random_state=42),
        'RFR': RandomForestRegressor(n_estimators=100, random_state=42),
    }
    if xgb is not None:
        models['XGBoost'] = xgb.XGBRegressor(n_estimators=100, random_state=42, verbosity=0)
    if lgb is not None:
        models['LightGBM'] = lgb.LGBMRegressor(n_estimators=100, random_state=42, verbose=-1)
    
    results = {}
    
    # 使用 KFold 交叉验证 (比 LeaveOneOut 快，适合快速运行)
    # 如果数据量极小(<50)，建议改回 LeaveOneOut()
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    
    print(f"{'模型名称':<10} | {'RMSE':<10} | {'R2':<10}")
    print("-" * 35)
    
    # 1. 训练基础模型
    for name, model in models.items():
        # cross_val_predict 可以得到交叉验证的预测结果
        from sklearn.model_selection import cross_val_predict
        try:
            predictions = cross_val_predict(model, X_scaled, y, cv=cv, n_jobs=-1)
            rmse = np.sqrt(mean_squared_error(y, predictions))
            r2 = r2_score(y, predictions)
            mae = mean_absolute_error(y, predictions)
            mape = mean_absolute_percentage_error(y, predictions)
            
            results[name] = {
                'RMSE': rmse, 'R2': r2, 'MAE': mae, 'MAPE': mape,
                'predictions': predictions, 'model_obj': model # 保存未训练的模型对象用于后续fit
            }
            print(f"{name:<10} | {rmse:<10.4f} | {r2:<10.4f}")
        except Exception as e:
            print(f"{name} 训练出错: {e}")

    # 2. 集成学习 - Voting (选择RMSE最小的3个模型)
    sorted_models = sorted(results.items(), key=lambda x: x[1]['RMSE'])
    best_3 = sorted_models[:3]
    estimators = [(name, models[name]) for name, _ in best_3]
    
    voting_reg = VotingRegressor(estimators=estimators)
    voting_pred = cross_val_predict(voting_reg, X_scaled, y, cv=cv, n_jobs=-1)
    
    results['Voting'] = {
        'RMSE': np.sqrt(mean_squared_error(y, voting_pred)),
        'R2': r2_score(y, voting_pred),
        'MAE': mean_absolute_error(y, voting_pred),
        'MAPE': mean_absolute_percentage_error(y, voting_pred),
        'predictions': voting_pred
    }
    print(f"{'Voting':<10} | {results['Voting']['RMSE']:<10.4f} | {results['Voting']['R2']:<10.4f}")

    # 3. 集成学习 - Stacking
    stacking_reg = StackingRegressor(
        estimators=estimators,
        final_estimator=Ridge()
    )
    stack_pred = cross_val_predict(stacking_reg, X_scaled, y, cv=cv, n_jobs=-1)
    
    results['Stacking'] = {
        'RMSE': np.sqrt(mean_squared_error(y, stack_pred)),
        'R2': r2_score(y, stack_pred),
        'MAE': mean_absolute_error(y, stack_pred),
        'MAPE': mean_absolute_percentage_error(y, stack_pred),
        'predictions': stack_pred
    }
    print(f"{'Stacking':<10} | {results['Stacking']['RMSE']:<10.4f} | {results['Stacking']['R2']:<10.4f}")
    
    return results, models, scaler, X_scaled

# ==========================================
# 5. 模型性能可视化
# ==========================================
def visualize_model_comparison(results, y_true):
    """绘制模型性能对比柱状图和预测散点图"""
    model_names = list(results.keys())
    rmse_values = [results[m]['RMSE'] for m in model_names]
    r2_values = [results[m]['R2'] for m in model_names]
    
    # 1. RMSE 和 R2 对比图
    fig, ax1 = plt.subplots(figsize=(12, 6))
    
    x = np.arange(len(model_names))
    width = 0.35
    
    bars1 = ax1.bar(x - width/2, rmse_values, width, label='RMSE', color='coral', alpha=0.8)
    ax1.set_ylabel('RMSE', color='coral')
    ax1.set_title('各模型性能对比 (RMSE & R²)')
    ax1.set_xticks(x)
    ax1.set_xticklabels(model_names, rotation=45)
    
    ax2 = ax1.twinx()
    bars2 = ax2.bar(x + width/2, r2_values, width, label='R²', color='skyblue', alpha=0.8)
    ax2.set_ylabel('R²', color='skyblue')
    
    plt.tight_layout()
    plt.show()
    
    # 2. 最佳模型的 预测值 vs 真实值
    best_model_name = min(results.keys(), key=lambda k: results[k]['RMSE'])
    best_pred = results[best_model_name]['predictions']
    
    plt.figure(figsize=(8, 8))
    plt.scatter(y_true, best_pred, alpha=0.6, c=np.abs(y_true - best_pred), cmap='coolwarm')
    # 画对角线
    min_val = min(y_true.min(), best_pred.min())
    max_val = max(y_true.max(), best_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2)
    plt.xlabel('真实值')
    plt.ylabel('预测值')
    plt.title(f'最佳模型 ({best_model_name}) 预测效果')
    plt.show()

# ==========================================
# 6-17. SHAP 全方位高级分析
# ==========================================
def run_all_shap_analyses(model, X_scaled, y, feature_names, model_name="GBR"):
    print(f"\n开始对 {model_name} 进行全方位 SHAP 分析...")
    model.fit(X_scaled, y)
    try:
        X_df = pd.DataFrame(X_scaled, columns=feature_names)
        explainer = shap.Explainer(model, X_df)
        shap_values = explainer(X_df)
    except Exception as e:
        print(f"SHAP Explaner 创建失败: {e}")
        return None
    plt.figure(figsize=(10, 8))
    shap.plots.beeswarm(shap_values, show=False)
    plt.title(f'{model_name} - 特征重要性蜂群图')
    plt.tight_layout()
    plt.show()
    plt.figure(figsize=(10, 6))
    shap.plots.bar(shap_values, show=False)
    plt.title(f'{model_name} - 特征重要性条形图')
    plt.tight_layout()
    plt.show()
    top_feature_idx = int(np.argsort(np.abs(shap_values.values).mean(0))[-1])
    top_feature_name = feature_names[top_feature_idx]
    plt.figure(figsize=(10, 6))
    shap.plots.scatter(shap_values[:, top_feature_idx], show=False)
    plt.title(f'特征依赖图: {top_feature_name}')
    plt.tight_layout()
    plt.show()
    sample_idx = 0
    plt.figure(figsize=(10, 6))
    shap.plots.waterfall(shap_values[sample_idx], show=False)
    plt.title(f'样本 {sample_idx} 的预测解释 (瀑布图)')
    plt.tight_layout()
    plt.show()
    print("正在进行 SHAP 值聚类分析...")
    vals = shap_values.values
    kmeans = KMeans(n_clusters=3, random_state=42)
    clusters = kmeans.fit_predict(vals)
    pca = PCA(n_components=2)
    shap_pca = pca.fit_transform(vals)
    plt.figure(figsize=(10, 6))
    plt.scatter(shap_pca[:, 0], shap_pca[:, 1], c=clusters, cmap='viridis', s=50, alpha=0.7)
    plt.title('基于 SHAP 值的样本聚类 (PCA降维)')
    plt.xlabel('PC1')
    plt.ylabel('PC2')
    plt.colorbar(label='Cluster')
    plt.show()
    return shap_values

# ==========================================
# 主程序入口
# ==========================================
if __name__ == "__main__":
    print("程序开始运行...")
    
    # 1. 准备数据文件 (如果当前目录没有文件，就生成一个)
    data_file = 'training_dataset1.xlsx'
    if not os.path.exists(data_file):
        generate_dummy_data(data_file)
        
    # 2. 加载数据
    data = load_and_validate_data(data_file)
    
    if data is not None:
        # 3. 探索性分析
        enhanced_eda(data)
        
        # 4. 特征工程
        X_extended, y, extended_names = advanced_feature_engineering(data)
        
        # 5. 模型训练与对比
        results, models, scaler, X_scaled = optimized_model_training(X_extended, y, extended_names)
        visualize_model_comparison(results, y)
        
        # 6. 自动选择最佳模型进行 SHAP 分析
        # 排除 Voting 和 Stacking，因为 TreeExplainer 最好直接用于树模型
        # 我们优先选 GBR, XGBoost 或 LightGBM 中效果最好的
        candidates = [m for m in ['GBR', 'XGBoost', 'LightGBM', 'RFR'] if m in results]
        best_tree_model_name = None
        best_rmse = float('inf')
        
        for name in candidates:
            if name in results and results[name]['RMSE'] < best_rmse:
                best_rmse = results[name]['RMSE']
                best_tree_model_name = name
        
        if best_tree_model_name:
            print(f"\n选中最佳树模型 [{best_tree_model_name}] 进行 SHAP 深度解释...")
            # 获取原始模型对象
            model_to_explain = models[best_tree_model_name]
            run_all_shap_analyses(model_to_explain, X_scaled, y, extended_names, best_tree_model_name)
        else:
            print("未找到合适的树模型进行SHAP分析。")
            
    print("\n所有程序执行完毕。")
