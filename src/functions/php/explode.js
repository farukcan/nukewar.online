function(str,separator, limit)
{
    var arr = str.split(separator);
    if (limit) arr.push( arr.splice(limit-1).join(separator) );
    return arr;
}