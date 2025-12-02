# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""

from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
# Generate sample data
X, y = make_blobs(random_state=123456)
# Perform KMeans clustering
kmeans = KMeans(n_clusters=2, random_state= 123456)
labels = kmeans.fit_predict(X)
# Calculate Silhouette Score
score = silhouette_score(X, labels)
print(f'Silhouette Score: {score}')

for n_clusters in range(2,11):
    kmeans = KMeans(n_clusters=n_clusters, random_state=123456)
   # print (f'n_clusters ={n_clusters}:silhouette_Score = {score:.4f}')
    labels=kmeans.fit_predict(X)
    score=silhouette_score(X, labels)
    #print (f'n_clusters ={n_clusters}:silhouette_Score = {score:.4f}')
print (f'n_clusters ={n_clusters}:silhouette_Score = {score:.4f}')