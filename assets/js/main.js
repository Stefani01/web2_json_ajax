const BASE = "assets/data/";
let nizIdIspisKategorija = Array("#ispisFiltera", "#miniIspisFiltera");
let nizIdIspisMenija = Array("#footerLinkoviMeni", "#navbarMeni");
let nizGrid = Array("#grid2", "#grid3", "#grid4");
let gridKlasa = Array(6, 4, 3);

let objProizvodi = getLocaleStorage("proizvodi");
let provera_proizvodiNaPopustu = false;
let provera_paketProizvodi = false;
let provera_filterProizvodiPoKat = false;

window.onload = function(){
    var proizvodiNaPopustuObj, paketProizvodiObj, proizvodiPoKategorijamaObj;

    if(getLocaleStorage("proizvodiNaPopustu")){
        provera_proizvodiNaPopustu = true;
        proizvodiNaPopustuObj = getLocaleStorage("proizvodiNaPopustu");
    }

    if(getLocaleStorage("paketProizvodi")){
        provera_paketProizvodi = true;
        paketProizvodiObj = getLocaleStorage("paketProizvodi");
    }

    if(getLocaleStorage("filterProizvodiPoKategorijama")){
        provera_filterProizvodiPoKat = true;
        proizvodiPoKategorijamaObj = getLocaleStorage("filterProizvodiPoKategorijama");
    }


    ajaxFunction("meni", "get", function(data){
        nizIdIspisMenija.forEach(el => {
            ispisMenija(data, el);
        });
    });

    ajaxFunction("kategorije", "get", function(data){
        setLocaleStorage("kategorije", data);
    });

    ajaxFunction("proizvodKategorija", "get", function(data){
        setLocaleStorage("proizvodKategorija", data);
        var kategorije = getLocaleStorage("kategorije");
        nizIdIspisKategorija.forEach(el => {
            ispisiKateogorijeProizvoda(kategorije, data, el);
        });
    });

    ajaxFunction("proizvodi", "get", function(data){
        setLocaleStorage("proizvodi", data);
        ispisProizvoda(data, "3");
    })

    ispisListeZaSortiranje();
    klikIspisProizvoda(nizGrid, gridKlasa);

   
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

    html += `<div class="mt-5 mb-5 border-top border-bottom p-2">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="truePaketi" name="paket">
                    <label class="form-check-label" for="truePaketi">Paket proizvodi</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="truePopust" name="popust">
                    <label class="form-check-label" for="trueAkcija">Na popustu</label>
                </div>
            </div>`;

    $("[name='paket']").click(filtrirajPoPaketima);
    $("[name='popust']").click(filtrirajPoPopustu);
    $("[name='kategorije']").click(filterPoKategorijama);
    $(deoStrane).html(html);
    
}

function chbFilterKategorije(katPoId){
    let html = "";

    for(let kp of katPoId){
        html += `<div class="form-check">
            <input class="form-check-input" type="checkbox" value="${kp.id}" name="kategorije">
            <label class="form-check-label" for="${kp.id}">${kp.naziv}</label>
        </div>`;
    }

    return html;
}

function ispisListeZaSortiranje(){
    let html = `<option value="0">Sortiraj</option>
    <option value="asc">Cena rastuće</option>
    <option value="dsc">Cena opadajuće</option>
    <option value="a-z">Naziv proizvoda A-Z</option>
    <option value="z-a">Naziv proizvoda Z-A</option>`;
    $(".ispisiSort").html(html);
}

$(document).on("change", ".ispisiSort", function(){
    let vrednost = $(this).val();
    let sortiraniProizvodi;

    if(vrednost == 0){
        sortiraniProizvodi = getLocaleStorage("proizvodi");
    }
    if(vrednost == "asc"){
        sortiraniProizvodi = objProizvodi.sort(function(a,b){
            return a.cena-b.cena;
        })
    }
    if(vrednost == "dsc"){
        sortiraniProizvodi = objProizvodi.sort(function(a,b){
            return b.cena-a.cena;
        })
    }
    if(vrednost == "a-z"){
        sortiraniProizvodi = objProizvodi.sort(function(a,b){
            if(a.naziv < b.naziv){
                return -1;
            }
            if(a.naziv > b.naziv){
                return 1;
            }
            if(a.naziv == b.naziv){
                return 0;
            }
        })
    }
    if(vrednost == "z-a"){
        sortiraniProizvodi = objProizvodi.sort(function(a,b){
            if(a.naziv < b.naziv){
                return 1;
            }
            if(a.naziv > b.naziv){
                return -1;
            }
            if(a.naziv == b.naziv){
                return 0;
            }
        })
    }

    ispisProizvoda(sortiraniProizvodi, "3");
    
})

function ispisProizvoda(proizvodi, klasaPrikaz){
    let html = "";

    for(let proizvod of proizvodi){
        html += `   
        <div class="col-12 col-md-6 col-lg-${klasaPrikaz} mb-3">
            <a href="prikazProizvoda.html" data-id="${proizvod.id}" class="text-decoration-none link-dark">
                <figure class="figure d-flex flex-column align-content-end">
                    <img src="assets/images/${proizvod.slika}" class="figure-img img-fluid h-100 rounded" alt="${proizvod.opis}">
                    <figcaption class="figure-caption text-dark">
                        <h2 class="m-0">${proizvod.naziv}</h2>
                        <p class="mt-2">${proizvod.opis}</p>
                        <h5 class="text-center mb-3">${proizvod.cena}</h5>
                        <button class="btn btn-dark bojaShimmer mb-3 d-block mx-auto" data-idKorpa="${proizvod.id}">
                            <i class="fas fa-shopping-cart me-2"></i>Dodaj u korpu
                        </button>
                    </figcaption>
                </figure>
            </a>   
        </div>`;
    }

    $("#ispisProizvoda").html(html);
}

function klikIspisProizvoda(nizGrid, gridKlasa){
    for(let i=0; i<nizGrid.length;i++){
        dodeliAkciju(nizGrid[i], gridKlasa[i]);
    }
}

function dodeliAkciju(grid, klasa){
    $(grid).click(function(){
        if(grid == "#grid4"){
            $("#grid4").hide();
        }
        else{
            $("#grid4").show();
        }

    
        if(provera_proizvodiNaPopustu){
            ispisProizvoda(proizvodiNaPopustuObj, klasa);
        }
        if(provera_paketProizvodi){
            ispisProizvoda(paketProizvodiObj, klasa);
        }
        if(provera_filterProizvodiPoKat){
            ispisProizvoda(proizvodiPoKategorijamaObj, klasa);
        }
        ispisProizvoda(objProizvodi, klasa);
    })
}


$(document).on("keyup","#inputSearch", function(){
    let upisano = $(this).val();
    let filtriranoPoUpisu = objProizvodi.filter(p => p.naziv.toLowerCase().indexOf(upisano.toLowerCase()) != -1);

    if(filtriranoPoUpisu.length == 0){
        ispisProizvoda(objProizvodi, "3");
    }
    else{
        ispisProizvoda(filtriranoPoUpisu, "3");
    }
    
})

function filtrirajPoPaketima(){
    let filter_paketProizvodi = [];

    if($("input[name='paket']").is(":checked")){
        filter_paketProizvodi = objProizvodi.filter(p => p.paket);
    }
    else{
        filter_paketProizvodi = objProizvodi;
    }
    setLocaleStorage("paketProizvodi", filter_paketProizvodi);
    ispisProizvoda(filter_paketProizvodi, "3");
}

function filtrirajPoPopustu(){
    let filter_proizvodiNaPopustu = [];
    if($("input[name='popust']").is(":checked")){
        filter_proizvodiNaPopustu = objProizvodi.filter(p => p.popust == 0);
    }
    else{
        filter_proizvodiNaPopustu = objProizvodi;
    }
    setLocaleStorage("proizvodiNaPopustu", filter_proizvodiNaPopustu);
    ispisProizvoda(filter_proizvodiNaPopustu, "3");
}

function filterPoKategorijama(){
    let cekirano = [];
    $.each($("input[name='kategorije']:checked"), function(){
        cekirano.push($(this).val());
    });
    
    let proizvodiPoKategorijama = objProizvodi.filter(function(el){
        for(let cek of cekirano){
            if(cek == el.katProizvod){
                return true;
            }
        }
    })

    if(proizvodiPoKategorijama.length == 0){
        proizvodiPoKategorijama = objProizvodi
    }
    
    ispisProizvoda(proizvodiPoKategorijama, "3");
    setLocaleStorage("filterProizvodiPoKategorijama", proizvodiPoKategorijama);
}