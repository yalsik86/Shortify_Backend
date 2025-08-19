import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    shortUrl: {
      type: String,
      required: true,
      unique: true,
    },
    longUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Invalid URL format',
      },
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const Url = mongoose.model('Url', urlSchema);
export default Url;