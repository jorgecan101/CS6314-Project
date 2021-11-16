$(document).ready(function() {

    var userInfo = {
        email = document.getElementsByID('email'),
        password = document.getElementsByID('password')
    }

 //   $.ajax({
 //       type: "POST",
 //       url: "/login",
 //       data: userInfo,
 //       success: function(data) {
 //           
 //       }
 //   });

    $('form').click(function (){
        console.log("form was submitted");
    });
});