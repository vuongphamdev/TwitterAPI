import { ObjectId } from 'mongodb'

export interface IBookMark {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  created_at?: Date
}

export default class Bookmark {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  created_at: Date

  constructor(bookmark: IBookMark) {
    const { tweet_id, user_id, created_at } = bookmark
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.created_at = created_at || new Date()
  }
}
