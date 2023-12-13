import { TCategory } from "./category.interface";
import Category from "./category.model";

// create a category
const createCategoryIntoDB = async (payload: TCategory) => {
  const createdCategory = await Category.create(payload);

  const result = createdCategory.toObject();
  delete result.__v;

  return result;
};

// get all categories
const getAllCategorieFromDB = async () => {
  const result = await Category.find().select("-__v");

  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategorieFromDB,
};
