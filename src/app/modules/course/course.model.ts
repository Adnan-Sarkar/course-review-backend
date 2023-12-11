import { Schema, model } from "mongoose";
import { TCourse, TDetails, TTags } from "./course.interface";

const tagSchema = new Schema<TTags>(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const detailsSchema = new Schema<TDetails>(
  {
    level: {
      type: String,
      required: [true, "Course level is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
  },
  {
    _id: false,
  },
);

// create course schema
const courseSchema = new Schema<TCourse>({
  title: {
    type: String,
    required: [true, "Course title is required"],
    trim: true,
    unique: true,
  },
  instructor: {
    type: String,
    required: [true, "Course instructor is required"],
    trim: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Course category id is required"],
  },
  price: {
    type: Number,
    required: [true, "Course price is required"],
  },
  tags: {
    type: [tagSchema],
    required: [true, "Course tag is required"],
  },
  startDate: {
    type: String,
    required: [true, "Course start date is required"],
    trim: true,
  },
  endDate: {
    type: String,
    required: [true, "Course end date is required"],
    trim: true,
  },
  language: {
    type: String,
    required: [true, "Course language is required"],
    trim: true,
  },
  provider: {
    type: String,
    required: [true, "Course provider is required"],
    trim: true,
  },
  durationInWeeks: {
    type: Number,
  },
  details: {
    type: detailsSchema,
    required: [true, "Course details is required"],
  },
});

// create pre middleware to implement duration in weeks
courseSchema.pre("save", function (next) {
  const start = new Date(this.startDate).getTime();
  const end = new Date(this.endDate).getTime();

  const durationWeeks = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));

  this.durationInWeeks = durationWeeks;

  next();
});

// create course model
const Course = model<TCourse>("Course", courseSchema);

export default Course;
