import httpStatus from "http-status";
import AppError from "../../error/AppError";
import Review from "../review/review.model";
import { TCourse } from "./course.interface";
import Course from "./course.model";
import mongoose, { Document, PipelineStage } from "mongoose";
import Category from "../category/category.model";

// create a course
const createCourseIntoDB = async (payload: TCourse) => {
  const categoryId = payload.categoryId;
  // checked category is exists or not;
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Category is not found using id: ${categoryId}`,
    );
  }

  const createdCourse = await Course.create(payload);

  const result = createdCourse.toObject();

  delete result.__v;

  return result;
};

// get paginated, sorted & filtered courses
const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
  //  pagination
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  // sorting
  const sortProperties = [
    "title",
    "price",
    "startDate",
    "endDate",
    "language",
    "durationInWeeks",
  ];

  const sortOrder = (query?.sortOrder as string) === "desc" ? -1 : 1;

  const sortProperty = query?.sortBy as string;

  let allowSort = sortProperties.includes(sortProperty);

  // filter object
  const filterObj: Record<string, unknown> = {};

  // minPrice, maxPrice filtering
  const minPrice = query?.minPrice;
  const maxPrice = query?.maxPrice;

  if (minPrice || maxPrice) {
    let priceQuery: Record<string, unknown> = {};

    if (minPrice && maxPrice) {
      priceQuery = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      };
    } else if (minPrice) {
      priceQuery = {
        $gte: Number(minPrice),
      };
    } else if (maxPrice) {
      priceQuery = {
        $lte: Number(maxPrice),
      };
    }

    filterObj.price = priceQuery;
  }

  // apply tags filtering
  const tagName = query?.tags as string;

  if (tagName) {
    filterObj["tags.name"] = tagName;
  }

  // apply startDate, endDate filtering
  const startDate = query?.startDate;
  const endDate = query?.endDate;

  if (startDate && endDate) {
    filterObj.startDate = {
      $gte: startDate,
    };
    filterObj.endDate = {
      $lte: endDate,
    };
  } else if (startDate) {
    filterObj.startDate = {
      $gte: startDate,
    };
  } else if (endDate) {
    filterObj.endDate = {
      $lte: endDate,
    };
  }

  // language, provider, durationInWeeks, level filtering
  const language = query?.language;
  const provider = query?.provider;
  const durationInWeeks = query?.durationInWeeks;
  const level = query?.level;

  if (language) {
    filterObj.language = language;
  }
  if (provider) {
    filterObj.provider = provider;
  }
  if (durationInWeeks) {
    filterObj.durationInWeeks = Number(durationInWeeks);
  }
  if (level) {
    filterObj["details.level"] = level;
  }

  // create pipeline for aggregation stages
  const pipeline: PipelineStage[] = [];

  // pipeline statge for filtering - stage 1
  if (filterObj && Object.keys(filterObj).length) {
    pipeline.push({
      $match: filterObj,
    });
  }

  // pipeline stage for sorting - stage 2
  if (allowSort) {
    pipeline.push({
      $sort: {
        [sortProperty]: sortOrder,
      },
    });
  }

  // pipeline stage for pagination - stage 2
  pipeline.push({
    $skip: skip,
  });
  pipeline.push({
    $limit: limit,
  });

  // pipeline stage for project
  pipeline.push({
    $project: {
      __v: 0,
    },
  });

  const result = await Course.aggregate(pipeline);

  return result;
};

// get course by id with reviews
const getCourseByIdWithReviewsFromDB = async (id: string) => {
  const result: Record<string, unknown> = {};

  // start session
  const session = await mongoose.startSession();

  try {
    // start transaction
    session.startTransaction();

    // find the course - transaction 1
    const course = await Course.findById(id).select("-__v").session(session);

    // checked whether the course exists or not
    if (!course) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `No course found with id: ${id}`,
      );
    }

    // find the reviews - transaction 2
    const reviews = await Review.find({
      courseId: id,
    })
      .select({ courseId: 1, rating: 1, review: 1 })
      .session(session);

    // checked whether the course reviews exists or not
    if (!reviews) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `No course review found with course id: ${id}`,
      );
    }

    result.course = course;
    result.reviews = reviews;

    // commit transaction
    await session.commitTransaction();

    return result;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(httpStatus.BAD_REQUEST, error?.message, error);
  } finally {
    // end session
    await session.endSession();
  }
};

// get the best course based on average review
const getBestCourseFromDB = async () => {
  // create and start session
  const session = await mongoose.startSession();

  try {
    // start transaction
    session.startTransaction();

    // get bestCourse review - transaction 1
    const getBestCourse = await Review.aggregate([
      // stage 1 - group based on same course
      {
        $group: {
          _id: "$courseId",
          averageRating: {
            $avg: "$rating",
          },
          reviewCount: {
            $sum: 1,
          },
        },
      },

      // stage 2 - sort descending order based on averageRating
      {
        $sort: {
          averageRating: -1,
        },
      },

      // stage 3 - get the first review that has the highest average rating
      {
        $limit: 1,
      },

      // stage 4
      {
        $project: {
          courseId: 1,
          averageRating: 1,
          reviewCount: 1,
        },
      },
    ]).session(session);

    const { _id: bestCourseId, averageRating, reviewCount } = getBestCourse[0];

    if (!bestCourseId) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "No best course found based on rating",
      );
    }

    // get the best course - transaction 2
    const bestCourse: Document<any, any> | null = await Course.findById(
      bestCourseId,
    )
      .select("-__v")
      .session(session);

    if (bestCourse) {
      // convert mongoose Document to pure object
      const result = bestCourse.toObject();
      result.averageRating = averageRating;
      result.reviewCount = reviewCount;

      // commit transaction
      await session.commitTransaction();

      return result;
    }

    throw new AppError(
      httpStatus.NOT_FOUND,
      `No course found based on id: ${bestCourseId}`,
    );
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(httpStatus.BAD_REQUEST, error?.message);
  } finally {
    await session.endSession();
  }
};

// update course
const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
  const {
    tags,
    details,
    startDate,
    endDate,
    durationInWeeks,
    ...remainingData
  } = payload;

  const modifiedUpdatedData: Record<string, unknown> = { ...remainingData };

  // don't allow update durationInWeeks directly without startDate or endDate change
  if (durationInWeeks) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please update startDate or endDate to change durationInWeeks",
    );
  }

  // start session
  const session = await mongoose.startSession();

  try {
    // start transaction
    session.startTransaction();

    // if update startDate or endDate then update durationInWeeks field
    if (startDate || endDate) {
      // get current startDate and endDate - with transaction
      const currentInfo = await Course.findById(id).session(session);
      let durationWeeks = currentInfo?.durationInWeeks;

      if (startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        durationWeeks = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));

        modifiedUpdatedData.startDate = startDate;
        modifiedUpdatedData.endDate = endDate;
      } else if (startDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(currentInfo?.endDate as string).getTime();

        durationWeeks = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));

        modifiedUpdatedData.startDate = startDate;
      } else if (endDate) {
        const start = new Date(currentInfo?.startDate as string).getTime();
        const end = new Date(endDate).getTime();

        durationWeeks = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));

        modifiedUpdatedData.endDate = endDate;
      }

      // update new durationInWeeks field
      modifiedUpdatedData.durationInWeeks = durationWeeks;
    }

    // modified non-primitive fields to update for details
    if (details && Object.keys(details).length) {
      for (const [key, value] of Object.entries(details)) {
        modifiedUpdatedData[`details.${key}`] = value;
      }
    }

    // update primitive fields and details - with transaction
    await Course.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true,
      session,
    });

    // checked if there are any tags need to update
    if (tags && tags.length > 0) {
      // filer out deleted fields
      const deletedTagsList = tags
        .filter((tag) => {
          if (tag.isDeleted === true) {
            return true;
          }

          return false;
        })
        .map((tag) => tag.name);

      // delete tags if needed - with transaction
      const deletedTags = await Course.findByIdAndUpdate(
        id,
        {
          $pull: {
            tags: {
              name: {
                $in: deletedTagsList,
              },
            },
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!deletedTags) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Removing tags is not successful",
        );
      }

      // filter out new tags
      const newTagsList = tags.filter((tag) => {
        if (tag.isDeleted === false) {
          return true;
        }

        return false;
      });

      // add new tags - with transaction
      const updatedTags = await Course.findByIdAndUpdate(
        id,
        {
          $addToSet: {
            tags: {
              $each: newTagsList,
            },
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!updatedTags) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Add new tags is not successful",
        );
      }
    }

    // get all updated data for response - with transaction
    const result = await Course.findById(id).select("-__v").session(session);

    // commit transaction
    await session.commitTransaction();

    return result;
  } catch (error: any) {
    await session.abortTransaction();

    throw new AppError(httpStatus.BAD_REQUEST, error?.message, error);
  } finally {
    // end session
    await session.endSession();
  }
};

export const CourseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
  getCourseByIdWithReviewsFromDB,
  getBestCourseFromDB,
  updateCourseIntoDB,
};
