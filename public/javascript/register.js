 /*
- Check	the	new	username or	email address if it’s already registered to the	system	using AJAX.
- Form	validation:	Check	if	all	mandatory	fields	are	filled	out.	
- Check	if	password	is	strong	enough.	Define	the	rules	of	having	a	
strong	password.	User	passwords	should	be	hashed	and	hashed	
version	of	passwords	should	be	stored	in	the	database
*/
$(document).ready(function() {
    var emailCheck = true;
    var firstCheck = true;
    var lastCheck = true;
    var passwordCheck = true;
    var confirmCheck = true;

    var email = "";
    var first = "";
    var last = "";
    var password = "";
    var confirm = "";
    $('#email').blur(function(){
        email = $('#email').val();
        var emailErr = validate_email(email);
        $(".error").remove();
        if(emailErr != ""){
            $('#email').after('<span class="error">' + emailErr + '</span>');
            emailCheck = false;
        }
        else{
            emailCheck = true;
        }
    });
    $('#firstName').blur(function(){
        first = $('#firstName').val();
        $(".error").remove();
        if(first == ""){
            $('#firstName').after('<span class="error">First name is empty</span>');
            firstCheck = false;
        }
        else{
            firstCheck = true;
        }
    });
    $('#lastName').blur(function(){
        last = $('#lastName').val();
        $(".error").remove();
        if(last == ""){
            $('#lastName').after('<span class="error">Last name is empty</span>');
            lastCheck = false;
        }
        else{
            lastCheck = true;
        }
    });
    $('#password').blur(function(){
        password = $('#password').val();
        var passErr = validate_password(password);
        $(".error").remove();
        if(passErr != ""){
            $('#password').after('<span class="error">' + passErr + '</span>');
            passwordCheck = false;
        }
        else{
            passwordCheck = true;
        }
    });
    $('#confirm').blur(function(){
        confirm = $('confirm').val();
        password = $('password').val();
        $(".error").remove();
        if(confirm != password){
            $('#confirm').after('<span class="error">Passwords do not match</span>');
            confirmCheck = false;
        }
        else{
            confirmCheck = true;
        }
    });
    $('#registerForm').submit(function(e){
        e.preventDefault();
        $(".error").remove();
        //console.log(emailCheck + firstcheck + lastCheck + pass)
        if(emailCheck != true || firstCheck != true || lastCheck != true || passwordCheck != true || confirmCheck != true){
            $('#submit').after('<span class="error">Please complete all fields correctly</span>');
        }
        else{
            $.ajax({
                type: "POST",
                url: "/register",
                data: $('#registerForm').serialize(),
                dataType: "json",
                success: function(data) {
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
    
    //validate email format
    function validate_email(email){
        //var email = $('#email').val();
        var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(email == ""){
            return "Email is empty";
        }
        if(!email.match(regex)){
            return "Invalid email address";
        }
        return "";
    }
    //validate password 
    function validate_password(password){
        if(password == ""){
            return "Password should include at least six characters";
        }
        if((password.length < 6)){
            return "Password should include at least six characters";
        }
        re=/[A-Z]/;
        if(!re.test(password)){
            return "Password should include at least one uppercase letter";
        }
        re=/[0-9]/;
        if(!re.test(password)){
            return "Password should include at least one digit";
        }
        re=/[!@#$%^&*+]/;
        if(!re.test(password)){
            return "Password should include at least one special character";
        }
        return "";
    }
    
    function validate_existedEmail(email){
        var existedCheck = false;
        //check if the user email already exists using AJAX
        $.ajax({
            type: "GET",
            url: "/api/accounts",
            dataType: "json",
            success: function(data) {
                console.log('success', data);
                $.each(data, function(index, account){
                    if(account.email == email){
                        console.log("found");
                        existedCheck = true;
                    }
                });
            },
            error: function(){
            }
        });
        return existedCheck;
    }
});