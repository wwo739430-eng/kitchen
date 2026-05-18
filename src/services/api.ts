/**
 * API Service - 纯前端版本
 * DeepSeek AI 直连 + localStorage 本地存储（无需后端）
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
  name: string;
  description: string;
  difficulty: string;
  time: string;
  calories: string;
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

// ==================== DeepSeek AI ====================

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

async function callDeepSeek(prompt: string): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('请在 .env 文件中配置 VITE_DEEPSEEK_API_KEY');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API 错误: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ==================== LocalStorage 工具 ====================

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

// ==================== 食谱 API ====================

export const recipeAPI = {
  generate: async (ingredients: Ingredient[], filters?: RecipeFilters): Promise<{ recipes: Recipe[] }> => {
    const ingredientList = ingredients.map((i) => `${i.name}(${i.quantity})`).join('、');
    const scenarioText = filters?.scenario ? `，场景偏好：${filters.scenario}` : '';

    const prompt = `你是一个专业的中式家庭厨师 AI，请根据以下食材为用户推荐 3 道菜谱${scenarioText}。

可用食材：${ingredientList}

要求：
1. 每道菜必须主要使用上述食材
2. 步骤简洁，适合家庭厨房
3. 严格按照以下 JSON 格式返回，不要加任何 markdown 代码块或其他文字

返回格式（纯 JSON 数组）：
[
  {
    "name": "菜名",
    "description": "一句话描述，15字以内",
    "difficulty": "简单",
    "time": "15分钟",
    "calories": "约300卡",
    "ingredients": [
      {"name": "食材名", "quantity": "用量", "status": "已有"}
    ],
    "steps": ["步骤1", "步骤2", "步骤3"],
    "tags": ["快手菜", "下饭"]
  }
]`;

    const raw = await callDeepSeek(prompt);

    // 尝试提取 JSON
    let jsonStr = raw.trim();
    const match = jsonStr.match(/\[[\s\S]*\]/);
    if (match) jsonStr = match[0];

    const recipes: Recipe[] = JSON.parse(jsonStr);

    // 保存到历史
    const history = lsGet<Recipe[]>('recipe_history', []);
    history.unshift(...recipes);
    lsSet('recipe_history', history.slice(0, 50));

    return { recipes };
  },

  getHistory: async (limit = 20): Promise<{ recipes: Recipe[] }> => {
    const history = lsGet<Recipe[]>('recipe_history', []);
    return { recipes: history.slice(0, limit) };
  },
};

// ==================== 食材 API ====================

export const ingredientAPI = {
  getAll: async (): Promise<{ ingredients: Ingredient[] }> => {
    const ingredients = lsGet<Ingredient[]>('ingredients', []);
    return { ingredients };
  },

  add: async (ingredient: Ingredient): Promise<Ingredient> => {
    const ingredients = lsGet<Ingredient[]>('ingredients', []);
    const newItem: Ingredient = {
      ...ingredient,
      id: Date.now(),
      storage_location: ingredient.storage_location || 'fridge',
    };
    ingredients.push(newItem);
    lsSet('ingredients', ingredients);
    return newItem;
  },

  update: async (id: number, data: Partial<Ingredient>): Promise<Ingredient> => {
    const ingredients = lsGet<Ingredient[]>('ingredients', []);
    const idx = ingredients.findIndex((i) => i.id === id);
    if (idx !== -1) {
      ingredients[idx] = { ...ingredients[idx], ...data };
      lsSet('ingredients', ingredients);
      return ingredients[idx];
    }
    throw new Error('食材不存在');
  },

  delete: async (id: number): Promise<void> => {
    const ingredients = lsGet<Ingredient[]>('ingredients', []);
    lsSet('ingredients', ingredients.filter((i) => i.id !== id));
  },
};

// ==================== 收藏 API ====================

export interface FavoriteItem {
  id: number;
  recipe: Recipe;
  group: string;
  createdAt: string;
}

export const favoriteAPI = {
  getAll: async (): Promise<{ favorites: FavoriteItem[] }> => {
    return { favorites: lsGet<FavoriteItem[]>('favorites', []) };
  },

  add: async (recipe: Recipe, group = '默认分组'): Promise<FavoriteItem> => {
    const favorites = lsGet<FavoriteItem[]>('favorites', []);
    const newItem: FavoriteItem = {
      id: Date.now(),
      recipe,
      group,
      createdAt: new Date().toISOString(),
    };
    favorites.unshift(newItem);
    lsSet('favorites', favorites);
    return newItem;
  },

  delete: async (id: number): Promise<void> => {
    const favorites = lsGet<FavoriteItem[]>('favorites', []);
    lsSet('favorites', favorites.filter((f) => f.id !== id));
  },
};

// ==================== 购物清单 API ====================

export interface ShoppingItem {
  id: number;
  name: string;
  quantity: string;
  checked: boolean;
}

export const shoppingListAPI = {
  getAll: async (): Promise<{ items: ShoppingItem[] }> => {
    return { items: lsGet<ShoppingItem[]>('shopping_list', []) };
  },

  generate: async (recipes: Recipe[]): Promise<{ items: ShoppingItem[] }> => {
    const existing = lsGet<Ingredient[]>('ingredients', []).map((i) => i.name);

    const allIngredients = recipes.flatMap((r) =>
      r.ingredients
        .filter((i) => i.status === '需补充' || !existing.includes(i.name))
        .map((i) => ({ name: i.name, quantity: i.quantity }))
    );

    // 去重合并
    const merged: Record<string, string> = {};
    for (const item of allIngredients) {
      merged[item.name] = item.quantity;
    }

    const items: ShoppingItem[] = Object.entries(merged).map(([name, quantity], idx) => ({
      id: Date.now() + idx,
      name,
      quantity,
      checked: false,
    }));

    const existing_list = lsGet<ShoppingItem[]>('shopping_list', []);
    lsSet('shopping_list', [...existing_list, ...items]);
    return { items };
  },

  add: async (name: string, quantity: string): Promise<ShoppingItem> => {
    const items = lsGet<ShoppingItem[]>('shopping_list', []);
    const newItem: ShoppingItem = { id: Date.now(), name, quantity, checked: false };
    items.push(newItem);
    lsSet('shopping_list', items);
    return newItem;
  },

  update: async (id: number, checked: boolean): Promise<ShoppingItem> => {
    const items = lsGet<ShoppingItem[]>('shopping_list', []);
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items[idx].checked = checked;
      lsSet('shopping_list', items);
      return items[idx];
    }
    throw new Error('清单项不存在');
  },

  delete: async (id: number): Promise<void> => {
    const items = lsGet<ShoppingItem[]>('shopping_list', []);
    lsSet('shopping_list', items.filter((i) => i.id !== id));
  },
};

export default {};
