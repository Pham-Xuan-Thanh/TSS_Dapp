const mongoose = require("mongoose")

const chapterSchema = mongoose.Schema({title: String , filepath: String, filehash: String, filehash_enc : String , index : Number,isPublish : Boolean ,size : Number, fileextension  : String, publishat : Number, expiredAt : Number})

const thesisSchema = mongoose.Schema({
    studentID: {
        type : Number,
        
    },
    article : {
        type: String, 
        trim : true
    },
    supervisor : {
        type : String,
        trim  : true
    },
    keywords: [String],
    chapters: {
        type : [chapterSchema],
        default : []
    },
    description : {
        type : String,
        default : "A thesis from user"
    },
    userid : {
        type : mongoose.SchemaTypes.ObjectId, ref : "User" ,
        unique : true
    }
})

// thesisSchema.pre('save',function(next){

//     if (this.isNew) {
//         Thesis.chapters.count().then(res => {
//             if (res >0) {
//                 this.chapters.filter(chapter => !chapter.index )[0].index = res-1
//             }
//             else {
//                 this.chapters.filter(chapter => !chapter.index )[0].index = 0
//             }
//             next()
//         }
//         )
//     } else{
//         next()
//     }
// })

const Thesis = mongoose.model('Thesis',thesisSchema)

module.exports = {Thesis}