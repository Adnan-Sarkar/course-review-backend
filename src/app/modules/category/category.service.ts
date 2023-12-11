import { TCategory } from "./category.interface";
import Category from "./category.model";

// create a category
const createCategoryIntoDB = async (payload: TCategory) => {
  const result = await Category.create(payload);

  return result;
};

// get all categories
const getAllCategorieFromDB = async () => {
  const result = await Category.find();

  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategorieFromDB,
};
