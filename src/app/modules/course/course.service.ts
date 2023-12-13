import httpStatus from "http-status";
import AppError from "../../error/AppError";
import Review from "../review/review.model";
import { TCourse } from "./course.interface";
import Course from "./course.model";
import mongoose, { Document } from "mongoose";

// create a course
const createCourseIntoDB = async (payload: TCourse) => {
  const result = await Course.create(payload);

  return result;
};

// get paginated, sorted & filtered courses
const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
  // create query
  let courseQuery = Course.find();

  // apply pagination
  let page = Number(query?.page) || 1;
  let limit = Number(query?.limit) || 10;
  let skip = (page - 1) * limit;

  courseQuery = courseQuery.skip(skip).limit(limit);

  // apply sorting
  const sortProperties = [
    "title",
    "price",
    "startDate",
    "endDate",
    "language",
    "duration",
  ];

  const sortOrder = (query?.sortOrder as string) === "desc" ? "desc" : "asc";

  const sortByproperties = (query?.sortBy as string)?.split(",");

  let allowSort = true;

  // if the sort field is none of sortProperties, then not allow sorting
  sortByproperties?.forEach((element) => {
    if (!sortProperties.includes(element)) {
      allowSort = false;
    }
  });

  if (allowSort && sortByproperties) {
    // use sort:  [['field', 'asc'], ...]

    const sortArray: [string, "asc" | "desc"][] = sortByproperties.map(
      (element) => {
        return [element, sortOrder];
      },
    );

    courseQuery = courseQuery.sort(sortArray);
  }

  // apply minPrice, maxPrice filtering
  const minPrice = query?.minPrice;
  const maxPrice = query?.maxPrice;

  if (minPrice && maxPrice) {
    courseQuery = courseQuery.find({
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    });
  }

  // create filter object
  const filterObj: Record<string, unknown> = {};

  // apply tags filtering
  const tagName = query?.tags as string;

  if (tagName) {
    filterObj["tags.name"] = tagName;
  }

  // apply startDate, endDate filtering
  const startDate = query?.startDate;
  const endDate = query?.endDate;

  if (startDate && endDate && startDate <= endDate) {
    filterObj.startDate = {
      $gte: startDate,
    };

    filterObj.endDate = {
      $lte: endDate,
    };
  }

  // apply language, provider, durationInWeeks, level filtering
  const language = query?.language;
  const provider = query?.provider;
  const durationInWeeks = query?.duration;
  const level = query?.level;

  if (language) {
    filterObj.language = language;
  }
  if (provider) {
    filterObj.provider = provider;
  }
  if (durationInWeeks) {
    filterObj.durationInWeeks = durationInWeeks;
  }
  if (level) {
    filterObj["details.level"] = level;
  }

  courseQuery = courseQuery.find(filterObj);
  const result = await courseQuery.exec();

  return result;
};

// get course by id with reviews
const getCourseByIdWithReviewsFromDB = async (id: string) => {
  const result: Record<string, unknown> = {};

  const course = await Course.findById(id).select("-__v");
  const reviews = await Review.find({
    courseId: id,
  }).select({ courseId: 1, rating: 1, review: 1 });

  result.course = course;
  result.reviews = reviews;

  return result;
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
      } else if (startDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(currentInfo?.endDate as string).getTime();

        durationWeeks = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));
      } else if (endDate) {
        const start = new Date(currentInfo?.startDate as string).getTime();
        const end = new Date(endDate).getTime();

        durationWeeks = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));
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

    throw new AppError(httpStatus.BAD_REQUEST, error?.message);
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
