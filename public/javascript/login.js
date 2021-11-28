$(document).ready(function() {

    $('#loginForm').submit(function(e){
        e.preventDefault();
        var username = $('#username').val();
        var password = $('#password').val();

        $(".error").remove();
        if(username.length < 1){
            $('#username').after('<span class="error">Username is empty</span>');
        }
        if(password.length < 1){
            $('#password').after('<span class="error">Password is empty</span>');
        }
        else{
            console.log(password + " " + username);
            var userInfo = {
                username: username,
                password: password
            };
            $.ajax({
                type: "POST",
                url: "/login",
                data: userInfo,
                success: function(data) {
                   clearInputs();
                   if(data.status === "Success"){
                        window.location = data.redirect;
                   }
                   if(data.status === "Failure"){
                        $('#submit').after('<span class="error">' + data.message + '</span>');
                   }
                },
                error: function(){
                    
                }
            });
        }
    });
    
    function clearInputs() {
        $("#username").val('');
        $("#password").val('');
    }
});