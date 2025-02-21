import mongoose, {Schema} from 'mongoose'

const storeSchema = new Schema(
  {
    isOpen: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  
)

export const Store = mongoose.model("Store", storeSchema)
