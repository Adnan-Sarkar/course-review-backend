import { z } from "zod";

const categoryAllRequired = z.object({
  name: z.string({
    invalid_type_error: "Category name must be string",
    required_error: "Category name is required",
  }),
});

export const CategoryValidations = {
  categoryValidationSchema: categoryAllRequired,
};
