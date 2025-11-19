//--Page to navigate
//page: from HTML CLICK Example ?page:/01/demos/index.html

function loadPage(page) {
    //--get refrence for HTML Element by its Id
    //--contentFrame is iframe element type

    let iframeElement = document.getElementById("contentFrame");
    //give th iframe the HTML address
    iframeElement.src = page

    // Close sidebar on mobile
    document.getElementById("sidebar").classList.remove("show");
}


function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("show");
}