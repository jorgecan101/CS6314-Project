/*
- Check	the	new	username or	email address if it’s already registered to the	system	using AJAX.
- Form	validation:	Check	if	all	mandatory	fields	are	filled	out.	
- Check	if	password	is	strong	enough.	Define	the	rules	of	having	a	
strong	password.	User	passwords	should	be	hashed	and	hashed	
version	of	passwords	should	be	stored	in	the	database
*/
$(document).ready(function() {

    $('#registerForm').submit(function(e){
        e.preventDefault();
        var email = $('#email').val();
        var first = $('#firstName').val();
        var last = $('#lastName').val();
        var password = $('#password').val();
        var confirm = $('#confirm').val();

        var emailErr = validate_email();
        $(".error").remove();
        if(first == ""){
            $('#firstName').after('<span class="error">First name is empty</span>');
        }
        if(last == ""){
            $('#lastName').after('<span class="error">Last name is empty</span>');
        }
        if(emailErr != ""){
            $('#email').after('<span class="error">' + emailErr + '</span>');
        }
        if(password.length < 1){
            $('#password').after('<span class="error">Password is empty</span>');
        }
        if(confirm != password){
            $('#confirm').after('<span class="error">Passwords do not match</span>');
        }
        else{
            //check if the user email already exists using AJAX
            $.ajax({
                type: "POST",
                url: "/register",
                data: $('#registerForm').serialize(),
                dataType: "json",
                success: function(data) {
                    if(data.status === "Success"){
                        window.location = data.redirect;
                    }
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

    //validate email format
    function validate_email(){
        var email = $('#email').val();
        var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(email.value == ""){
            return "Email is empty";
        }
        if(!email.match(regex)){
            return "Invalid email address";
        }
        return "";
    }
});