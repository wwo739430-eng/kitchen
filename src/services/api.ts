/**
 * API Service - 后端对接版本
 * 所有数据请求通过后端 API，用户偏好仍使用 localStorage
 */

// ==================== 类型定义 ====================

export interface Ingredient {
  id?: number;
  name: string;
  quantity: string;
  category?: string;
  state?: string;
  storage_location?: 'fridge' | 'freezer' | 'pantry';
  image?: string;
  expiration_date?: string;
}

export interface Recipe {
  id?: number;
  name: string;
  description: string;
  difficulty: string;
  time: string;
  calories: string;
  cuisine?: string;
  taste?: string;
  scenario?: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    status: string;
  }>;
  steps: string[];
  tags: string[];
}

export interface RecipeFilters {
  cuisine?: string;
  taste?: string;
  scenario?: string;
  skill?: string;
}

// ==================== 用户偏好 ====================

export interface UserPreferences {
  taste_preference: 'light' | 'heavy' | 'medium' | null;
  cuisine_style: 'home' | 'sichuan' | 'cantonese' | 'jiangsu' | 'shandong' | 'zhejiang' | 'fujian' | 'anhui' | 'western' | null;
  fitness_goal: 'fat_loss' | 'muscle_gain' | 'maintain' | null;
  dietary_restrictions: string[];
  cooking_time: 'quick' | 'normal' | 'leisure' | null;
}

// ==================== 后端 API 基础配置 ====================

// 开发环境用 localhost，生产环境部署后替换为 Render 地址
const API_BASE = 'https://smartcook-backend-1-klzm.onrender.com/api';


async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 错误: ${response.status} - ${err}`);
  }

  return response.json() as Promise<T>;
}

// ==================== 偏好 → 筛选条件 / 提示词 转换 ====================

function preferencesToFilters(preferences: UserPreferences): RecipeFilters {
  const filters: RecipeFilters = {};

  if (preferences.cuisine_style) {
    const map: Record<string, string> = {
      home: '中式',
      sichuan: '中式',
      cantonese: '中式',
      jiangsu: '中式',
      shandong: '中式',
      zhejiang: '中式',
      fujian: '中式',
      anhui: '中式',
      western: '西式',
    };
    filters.cuisine = map[preferences.cuisine_style];
  }

  if (preferences.taste_preference) {
    const map: Record<string, string> = {
      light: '清淡',
      heavy: '辣',
      medium: '咸',
    };
    filters.taste = map[preferences.taste_preference];
  }

  if (preferences.cooking_time) {
    const map: Record<string, string> = {
      quick: '快手菜',
      normal: '快手菜',
      leisure: '硬菜',
    };
    filters.scenario = map[preferences.cooking_time];
  }

  return filters;
}

export function preferencesToPrompt(preferences: UserPreferences): string {
  const parts: string[] = [];

  if (preferences.taste_preference) {
    const tasteMap: Record<string, string> = {
      light: '清淡少油少盐，健康饮食',
      heavy: '重口味，可以多放调料、辣椒、酱油等',
      medium: '正常家常味道',
    };
    parts.push(tasteMap[preferences.taste_preference]);
  }

  if (preferences.cuisine_style) {
    const cuisineMap: Record<string, string> = {
      home: '中式家常菜做法',
      sichuan: '川菜风格，可以放辣椒花椒',
      cantonese: '粤菜风格，清淡鲜美，注重食材本味',
      jiangsu: '淮扬菜风格，精致细腻',
      shandong: '鲁菜风格，咸鲜为主',
      zhejiang: '浙菜风格，鲜嫩软滑',
      fujian: '闽菜风格，鲜香清淡',
      anhui: '徽菜风格，重油重色',
      western: '西式做法',
    };
    parts.push(cuisineMap[preferences.cuisine_style]);
  }

  if (preferences.fitness_goal) {
    const fitnessMap: Record<string, string> = {
      fat_loss: '低卡低脂，适合减脂期（控制总热量在500卡以内），少油少糖高蛋白',
      muscle_gain: '高蛋白饮食（每餐至少25g蛋白质），适量碳水，适合增肌期',
      maintain: '营养均衡即可',
    };
    parts.push(fitnessMap[preferences.fitness_goal]);
  }

  if (preferences.cooking_time) {
    const timeMap: Record<string, string> = {
      quick: '快手菜，15分钟内完成',
      normal: '正常时间，30分钟左右',
      leisure: '可以慢慢做，60分钟以上也行',
    };
    parts.push(timeMap[preferences.cooking_time]);
  }

  if (preferences.dietary_restrictions.length > 0) {
    parts.push(`饮食限制/忌口：${preferences.dietary_restrictions.join('、')}`);
  }

  return parts.length > 0 ? `用户偏好：${parts.join('；')}` : '';
}

// ==================== 食谱 API ====================

export const recipeAPI = {
  generate: async (ingredients: Ingredient[], filters?: RecipeFilters, userPreferences?: UserPreferences): Promise<{ recipes: Recipe[] }> => {
    // 合并筛选条件：手动筛选 + 用户偏好自动转换
    const mergedFilters: RecipeFilters & { user_preferences?: string } = { ...filters };

    if (userPreferences) {
      const prefFilters = preferencesToFilters(userPreferences);
      // 手动筛选优先级更高
      if (!mergedFilters.cuisine) mergedFilters.cuisine = prefFilters.cuisine;
      if (!mergedFilters.taste) mergedFilters.taste = prefFilters.taste;
      if (!mergedFilters.scenario) mergedFilters.scenario = prefFilters.scenario;

      // 把详细偏好作为额外提示传给后端
      const prefText = preferencesToPrompt(userPreferences);
      if (prefText) mergedFilters.user_preferences = prefText;
    }

    const body = {
      ingredients: ingredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        state: i.state || '新鲜',
      })),
      filters: mergedFilters,
    };

    const data = await apiRequest<{ success: boolean; recipes: Recipe[] }>('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { recipes: data.recipes };
  },

  getHistory: async (limit = 20): Promise<{ recipes: Recipe[] }> => {
    const data = await apiRequest<{ success: boolean; history: Recipe[] }>(
      `/recipes/history?limit=${limit}`
    );
    return { recipes: data.history };
  },

  getById: async (id: number): Promise<{ recipe: Recipe }> => {
    const data = await apiRequest<{ success: boolean; recipe: Recipe }>(`/recipes/${id}`);
    return { recipe: data.recipe };
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/recipes/${id}`, { method: 'DELETE' });
  },
};

// ==================== 食材 API ====================

export const ingredientAPI = {
  getAll: async (): Promise<{ ingredients: Ingredient[] }> => {
    return apiRequest('/ingredients');
  },

  add: async (ingredient: Ingredient): Promise<Ingredient> => {
    const data = await apiRequest<{ success: boolean; ingredient: Ingredient }>('/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredient),
    });
    return data.ingredient;
  },

  update: async (id: number, data: Partial<Ingredient>): Promise<Ingredient> => {
    const result = await apiRequest<{ success: boolean; ingredient: Ingredient }>(
      `/ingredients/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
    return result.ingredient;
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/ingredients/${id}`, { method: 'DELETE' });
  },
};

// ==================== 收藏 API ====================

export interface FavoriteItem {
  id: number;
  recipe_id?: number;
  recipe?: Recipe;
  group?: string;
  notes?: string;
  createdAt: string;
}

export const favoriteAPI = {
  getAll: async (): Promise<{ favorites: FavoriteItem[] }> => {
    return apiRequest('/favorites');
  },

  add: async (recipeId: number, group?: string, notes?: string): Promise<FavoriteItem> => {
    const data = await apiRequest<{ success: boolean; favorite: FavoriteItem }>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ recipe_id: recipeId, group_id: null, notes: notes || '' }),
    });
    return data.favorite;
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/favorites/${id}`, { method: 'DELETE' });
  },
};

// ==================== 购物清单 API ====================

export interface ShoppingItem {
  id: number;
  ingredient_name: string;
  quantity: string;
  category: string;
  is_purchased: boolean;
}

export const shoppingListAPI = {
  getAll: async (): Promise<{ items: ShoppingItem[] }> => {
    return apiRequest('/shopping-list');
  },

  add: async (name: string, quantity: string, category = '其他'): Promise<ShoppingItem> => {
    const data = await apiRequest<{ success: boolean; item: ShoppingItem }>('/shopping-list', {
      method: 'POST',
      body: JSON.stringify({ ingredient_name: name, quantity, category }),
    });
    return data.item;
  },

  generate: async (recipeId: number): Promise<{ items: ShoppingItem[] }> => {
    const data = await apiRequest<{ success: boolean; items: ShoppingItem[] }>('/shopping-list/generate', {
      method: 'POST',
      body: JSON.stringify({ recipe_id: recipeId }),
    });
    return { items: data.items };
  },

  update: async (id: number, data: Partial<ShoppingItem>): Promise<ShoppingItem> => {
    const result = await apiRequest<{ success: boolean; item: ShoppingItem }>(
      `/shopping-list/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
    return result.item;
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/shopping-list/${id}`, { method: 'DELETE' });
  },

  markPurchased: async (id: number): Promise<ShoppingItem> => {
    const result = await apiRequest<{ success: boolean; item: ShoppingItem }>(
      `/shopping-list/${id}/purchase`,
      { method: 'POST' }
    );
    return result.item;
  },

  clearPurchased: async (): Promise<void> => {
    await apiRequest('/shopping-list/purchased', { method: 'DELETE' });
  },
};

// ==================== 用户偏好 API（localStorage） ====================

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

const DEFAULT_PREFERENCES: UserPreferences = {
  taste_preference: null,
  cuisine_style: null,
  fitness_goal: null,
  dietary_restrictions: [],
  cooking_time: null,
};

export const preferencesAPI = {
  get: async (): Promise<UserPreferences> => {
    return lsGet<UserPreferences>('user_preferences', DEFAULT_PREFERENCES);
  },

  save: async (prefs: Partial<UserPreferences>): Promise<UserPreferences> => {
    const current = await preferencesAPI.get();
    const updated = { ...current, ...prefs };
    lsSet('user_preferences', updated);
    return updated;
  },

  reset: async (): Promise<UserPreferences> => {
    lsSet('user_preferences', DEFAULT_PREFERENCES);
    return DEFAULT_PREFERENCES;
  },
};

export default {};
