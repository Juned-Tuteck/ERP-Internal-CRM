import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface Lookup {
  id: string;
  title: string;
  lookup_category: string;
  sort_order: number;
  is_deleted: boolean;
}

/**
 * Fetch all lookups for a specific category
 * @param category - The lookup category to fetch (e.g., 'PROJECT_CATEGORY')
 * @returns Promise containing array of lookup items
 */
export const getLookupsByCategory = async (category: string): Promise<Lookup[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/lookup/category/${category}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching lookups for category ${category}:`, error);
    throw error;
  }
};

/**
 * Fetch project categories from lookups
 * @returns Promise containing array of project category lookup items
 */
export const getProjectCategories = async (): Promise<Lookup[]> => {
  return getLookupsByCategory('LOOKUP_PROJECT_TYPE');
};

/**
 * Fetch project templates from lookups
 * @returns Promise containing array of project template lookup items
 */
export const getProjectTemplates = async (): Promise<Lookup[]> => {
  return getLookupsByCategory('PROJECT_TEMPLATE');
};

/**
 * Get lookup title by ID
 * @param id - The UUID of the lookup item
 * @param category - The lookup category
 * @returns Promise containing the title of the lookup item
 */
export const getLookupTitleById = async (id: string, category: string): Promise<string | null> => {
  try {
    const lookups = await getLookupsByCategory(category);
    const lookup = lookups.find(item => item.id === id);
    return lookup?.title || null;
  } catch (error) {
    console.error(`Error getting lookup title for id ${id}:`, error);
    return null;
  }
};
