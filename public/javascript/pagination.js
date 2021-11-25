$(document).ready(function() {

    // $(".list-wrapper").append()
    var perPage = 1; // we want to get 9 things per page in our pagination
    var pageCount = Math.ceil($(".myContent").length / perPage);


    // $("#pagination-container").pagination({
    for(var i = 0 ; i < pageCount;i++) {
        $("#paging").append('<li><a href="#">'+(i+1)+'</a></li> ');
    }
    $("#paging li").first().find("a").addClass("current");
    
    showPage = function(page) {
        $(".myContent").hide();
        $(".myContent").each(function(n) {
            if (n >= pageSize * (page - 1) && n < pageSize * page)
                $(this).show();
        });        
    }
    showpage(1);

    $("#paging li a").click(function() {
	    $("#paging li a").removeClass("current");
	    $(this).addClass("current");
	    showPage(parseInt($(this).text())) 
	});
});