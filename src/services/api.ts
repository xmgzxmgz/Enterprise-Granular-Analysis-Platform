const base = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

async function request(path: string, init?: RequestInit) {
  const res = await fetch(base + path, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function ping() {
  return request("/health");
}

export async function search(q: string) {
  return request(`/search?q=${encodeURIComponent(q)}`);
}

export async function getTags(query?: string) {
  const url = query ? `/tags?query=${encodeURIComponent(query)}` : "/tags";
  return request(url);
}

export async function getTagDistribution() {
  return request("/tags/distribution");
}

export async function getEnterpriseBasicInfo(category?: string) {
  const url = category
    ? `/enterprise/basic-info?category=${encodeURIComponent(category)}`
    : "/enterprise/basic-info";
  return request(url);
}

export async function getModelPressure() {
  return request("/modeling/pressure");
}

export async function getModelTraining() {
  return request("/modeling/training");
}

export async function updateEnterpriseTags(payload: {
  name: string;
  tags: string[];
  source?: "manual" | "model";
}) {
  return request("/enterprise/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getPolicies() {
  return request("/policies");
}

export async function getModelPrepData() {
  return request("/modeling/prep");
}
