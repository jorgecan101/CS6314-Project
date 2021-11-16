$(document).ready(function() {

    $('#loginForm').submit(function(e){
        e.preventDefault();
        var email = $('#email').val();
        var password = $('#password').val();

        $(".error").remove();
        if(email.length < 1){
            $('#email').after('<span class="error">Email is empty</span>');
        }
        if(password.length < 1){
            $('#password').after('<span class="error">Password is empty</span>');
        }
        else{
            console.log(password + " " + email);
            var userInfo = {
                email: email,
                password: password
            };
            $.ajax({
                type: "POST",
                url: "/login",
                data: userInfo,
                success: function(data) {
                   clearInputs();
                },
                error: function(){
                    
                }
            });
        }
    });
    
    function clearInputs() {
        $("#email").val('');
        $("#password").val('');
    }
});