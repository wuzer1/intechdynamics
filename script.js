$(document).ready(function(){
    $(window).scroll(function() { // check if scroll event happened
        if ($(document).scrollTop() > 50) { // check if user scrolled more than 50 from top of the browser window
            $("#primary-nav").css("background", "linear-gradient(-145deg, rgba(82,22,170,0.9) 0%, rgba(28,0,59,0.9) 72%)"); // if yes, adding gradient color to navbar and changes logo
            $("#logo_mic").css('display','inline-block');
            $("#logo").css('display','none');
        } else {
            $("#primary-nav").css("background", "transparent"); // // if not, change it back as it was before
            $("#logo_mic").css('display','none');
            $("#logo").css('display','inline-block');
        }
    });
});
        $(document).ready(function(){
            $('.demo').slick({
                accessibility:false,
                prevArrow: $('.prev'),
                nextArrow: $('.next'),
                // centerPadding: "4%",
                infinite: false,
            });
        });
