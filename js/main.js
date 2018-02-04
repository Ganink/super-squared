$(function () {
    let data = {
        puntos: []
    }
    let users = []
    var sw = true;
    $('.mdl').on('click', function () {
        $(this).find('.modal').addClass('is-active');
    });
    $('#pt').on('click', function () {
        $(this).find('.modal').addClass('is-active');
        data.puntos = localStorage.getItem('PUNTUACION ');
        let puntos = [];
        puntos.push(data.puntos);
        puntos.forEach(e => {
            $('.pt').append('<li> USUARIO: X PUNTUACION: ' + JSON.parse(e) + '</li>')
        })
    });
    $('.delete').on('click', function(){
        $('div').find('.modal').removeClass('is-active');
      $el.classList.remove('is-active');
    });
    $('.send').on('submit', function(){
        alert($('input:text').val())
        let user = $('input:text').val();
        users.push(user);
        localStorage.setItem('USER ', JSON.stringify(user));
    })
})