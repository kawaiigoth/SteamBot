{
    var $alertMessage = $("#alertMessage");

    $( "#settingsForm" ).submit(function( event ) {
        // Stop form from submitting normally
        event.preventDefault();

        // Get some values from elements on the page:
        var $form = $( this ),
            data = $form.serializeArray(),
            url = $form.attr( "action" );
        $form.find(':input[type=submit]').prop('disabled', true);

        var posting = $.post( url, data )
            .done(function(data) {
                $alertMessage.addClass( "alert-success show" );
                $("#alertText").text("Настройки успешно изменены.");
                $form.find(':input[type=submit]').prop('disabled', false);
            })
            .fail(function(data) {
                $alertMessage.addClass( "alert-danger show" );
                $("#alertText").text("Произошла неизвестная ошибка, но мы все постараемся исправить!");
                $form.find(':input[type=submit]').prop('disabled', false);
            });

    });

    $("button.close").click(function() {
        $(this).parent().removeClass("show")
    });

    $( "#currencyFormGive" ).submit(function( event ) {
    // Stop form from submitting normally
    event.preventDefault();

    // Get some values from elements on the page:
    var $form = $( this ),
        data = $form.serializeArray(),
        url = $form.attr( "action" );
        $form.find(':input[type=submit]').prop('disabled', true);
    var posting = $.post( url, data )
        .done(function(data) {
            $alertMessage.addClass( "alert-success show" );
            $("#alertText").text("Наш бот скоро с Вами свяжется. Вы будете перенаправлены через 3 секунды.");
            setTimeout(()=>{  window.location.replace("http://localhost:8080/"); }, 3000);
        })
        .fail(function(data) {
            $alertMessage.addClass( "alert-danger show" );
            $("#alertText").text("Произошла неизвестная ошибка, но мы все постараемся исправить!  Вы будете перенаправлены через 3 секунды.");
            setTimeout(()=>{  window.location.replace("http://localhost:8080/"); }, 3000);
        });

});

    $( "#currencyFormGet" ).submit(function( event ) {
        // Stop form from submitting normally
        event.preventDefault();

        // Get some values from elements on the page:
        var $form = $( this ),
            data = $form.serializeArray(),
            url = $form.attr( "action" );
        $form.find(':input[type=submit]').prop('disabled', true);
        var posting = $.post( url, data )
            .done(function(data) {
                $alertMessage.addClass( "alert-success show" );
                $("#alertText").text("Наш бот скоро с Вами свяжется. Вы будете перенаправлены через 3 секунды.");
                setTimeout(()=>{  window.location.replace("http://localhost:8080/"); }, 3000);
            })
            .fail(function(data) {
                $alertMessage.addClass( "alert-danger show" );
                $("#alertText").text("Произошла неизвестная ошибка, но мы все постараемся исправить!  Вы будете перенаправлены через 3 секунды.");
                setTimeout(()=>{  window.location.replace("http://localhost:8080/"); }, 3000);
            });

    });

    $( "#offerForm" ).submit(function( event ) {
        // Stop form from submitting normally
        event.preventDefault();

        // Get some values from elements on the page:
        var $form = $( this ),
            data = $form.serializeArray(),
            url = $form.attr( "action" );
        $form.find(':input[type=submit]').prop('disabled', true);
        $form[0].reset();
        var posting = $.post( url, data )
            .done(function(data) {
                $alertMessage.addClass( "alert-success show" );
                $("#alertText").text("Ваше предложение о покупке/продаже успешно создано.!.");
                $form.find(':input[type=submit]').prop('disabled', false);
            })
            .fail(function(data) {
                $alertMessage.addClass( "alert-danger show" );
                $("#alertText").text("Произошла неизвестная ошибка, но мы все постараемся исправить! ");
                $form.find(':input[type=submit]').prop('disabled', false);
            });

    });

    $('#offerTable').on('click', 'a', function(e){

    });
}
