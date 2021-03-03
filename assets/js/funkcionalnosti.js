$(document).ready(function(){
    
    $("#btnMeni").click(function(){
        $("#meniToggle").slideToggle(1000);
    })
    
    var nizElKojimaSeDodeljujeAnimacijaSlideToggle = Array("#test", "#slanje", "#kupovina", "#ostecenje", "#proizvod");
    dodeliAnimacijuSlideToggle(nizElKojimaSeDodeljujeAnimacijaSlideToggle);
   
    
})

function dodeliAnimacijuSlideToggle(niz){
    niz.forEach(element => {
        elementSLideToggle(element);
    });
}

function elementSLideToggle(elementClick){
    $(elementClick).click(function(){
        var element = $(this);
        element.next().slideToggle('slow');
        element.find(".fa-chevron-down").toggle();
        element.find(".fa-chevron-up").toggle();
    })
}

