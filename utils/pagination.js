module.exports = function paginate(startIndex,limit,totalItems,page){
 // Pagination result object
 const pagination = {};
 if (startIndex + limit < totalItems) {
   pagination.next = {
     page: page + 1,
     limit: limit,
   };
 }
 if (startIndex > 0) {
   pagination.prev = {
     page: page - 1,
     limit: limit,
   };
 }
return pagination
}