import { z } from "zod";

const courseAllRequired = z.object({
  title: z.string({
    invalid_type_error: "Course title must be string",
    required_error: "Course title is required",
  }),
  instructor: z.string({
    invalid_type_error: "Course instructor must be string",
    required_error: "Course instructor is required",
  }),
  categoryId: z.string({
    invalid_type_error: "Course category id must be string",
    required_error: "Course category id is required",
  }),
  price: z.number({
    invalid_type_error: "Course price must be number",
    required_error: "Course price is required",
  }),
  tags: z.array(
    z.object({
      name: z.string({
        invalid_type_error: "Course tag name must be string",
        required_error: "Course tag name is required",
      }),
      isDeleted: z
        .boolean({
          invalid_type_error: "Course tag isDeleted must be boolean",
        })
        .default(false)
        .optional(),
    }),
  ),
  startDate: z.string({
    invalid_type_error: "Course start date must be string",
    required_error: "Course start date is required",
  }),
  endDate: z.string({
    invalid_type_error: "Course end date must be string",
    required_error: "Course end date is required",
  }),
  language: z.string({
    invalid_type_error: "Course language must be string",
    required_error: "Course language is required",
  }),
  provider: z.string({
    invalid_type_error: "Course provider must be string",
    required_error: "Course provider is required",
  }),
  details: z.object({
    level: z.string({
      invalid_type_error: "Course level must be string",
      required_error: "Course level is required",
    }),
    description: z.string({
      invalid_type_error: "Course description must be string",
      required_error: "Course description is required",
    }),
  }),
});

const courseAllOptional = z.object({
  title: z
    .string({
      invalid_type_error: "Course title must be string",
      required_error: "Course title is required",
    })
    .optional(),
  instructor: z
    .string({
      invalid_type_error: "Course instructor must be string",
      required_error: "Course instructor is required",
    })
    .optional(),
  categoryId: z
    .string({
      invalid_type_error: "Course category id must be string",
      required_error: "Course category id is required",
    })
    .optional(),
  price: z
    .number({
      invalid_type_error: "Course price must be number",
      required_error: "Course price is required",
    })
    .optional(),
  tags: z
    .array(
      z.object({
        name: z
          .string({
            invalid_type_error: "Course tag name must be string",
            required_error: "Course tag name is required",
          })
          .optional(),
        isDeleted: z
          .boolean({
            invalid_type_error: "Course tag isDeleted must be boolean",
          })
          .default(false)
          .optional(),
      }),
    )
    .optional(),
  startDate: z
    .string({
      invalid_type_error: "Course start date must be string",
      required_error: "Course start date is required",
    })
    .optional(),
  endDate: z
    .string({
      invalid_type_error: "Course end date must be string",
      required_error: "Course end date is required",
    })
    .optional(),
  language: z
    .string({
      invalid_type_error: "Course language must be string",
      required_error: "Course language is required",
    })
    .optional(),
  provider: z
    .string({
      invalid_type_error: "Course provider must be string",
      required_error: "Course provider is required",
    })
    .optional(),
  details: z
    .object({
      level: z
        .string({
          invalid_type_error: "Course level must be string",
          required_error: "Course level is required",
        })
        .optional(),
      description: z
        .string({
          invalid_type_error: "Course description must be string",
          required_error: "Course description is required",
        })
        .optional(),
    })
    .optional(),
});

export const CourseValidations = {
  createCourseValidationSchema: courseAllRequired,
  updateCourseValidationSchema: courseAllOptional,
};
