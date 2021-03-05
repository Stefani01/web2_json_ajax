const BASE = "assets/data/";
let nizIdIspisKategorija = Array("#ispisFiltera", "#miniIspisFiltera");
let nizIdIspisMenija = Array("#footerLinkoviMeni", "#navbarMeni");

window.onload = function(){

    ajaxFunction("meni", "get", function(data){
        nizIdIspisMenija.forEach(el => {
            ispisMenija(data, el);
        });
    });

    ajaxFunction("kategorije", "get", function(data){
        setLocaleStorage("kategorije", data);
    });

    ajaxFunction("proizvodKategorija", "get", function(data){
        var kategorije = getLocaleStorage("kategorije");
        nizIdIspisKategorija.forEach(el => {
            ispisiKateogorijeProizvoda(kategorije, data, el);
        });
    })

}

function ajaxFunction(path,method, result){

    $.ajax({
        url: BASE + path + ".json",
        method: method,
        dataType: "json",
        success: result,
        error: function(xhr){
            console.error(xhr);
        }
    })
}

function setLocaleStorage(name, value){
    localStorage.setItem(name, JSON.stringify(value));
}

function getLocaleStorage(name){
    return JSON.parse(localStorage.getItem(name));
}

function removeLocaleStorage(name){
    localStorage.removeItem(name);
}

function ispisMenija(meni, deoStrane){
    let html = "";
    for(let m of meni){
        html += `
        <li class="list-group-item border-0">
            <a href="${m.hrefLink}" data-link="${m.id}" class="text-decoration-none">${m.textLink}</a>
        </li> `;
    }
    $(deoStrane).html(html);
}

/*
function izdvoji(data){
    
    return data.map((el) => {
        return{

        }
    })
}
*/

function ispisiKateogorijeProizvoda(kat, katProizvod, deoStrane){
    let html = "";

    kat.forEach(k => {
        let katPoId = katProizvod.filter(el => el.idKat == k.id);
        html += `<h5 class="text-center pt-2 pb-2">${k.naziv}</h5>
            ${chbFilterKategorije(katPoId)}`;      
    });

    $(deoStrane).html(html);
}

function chbFilterKategorije(katPoId){
    let html = "";

    for(let kp of katPoId){
        html += `<div class="form-check">
            <input class="form-check-input" type="checkbox" id="${kp.id}">
            <label class="form-check-label" for="${kp.id}">${kp.naziv}</label>
        </div>`;
    }

    return html;
}

$(document).on("click","#sadrzajSort li", function(){
    let vrednost = $(this).data("sort");
})