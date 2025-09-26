const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

function toggleSidebar() {
    sidebar.classList.toggle('close');
    toggleBtn.classList.toggle('rotate');
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page'); // select all elements with page class
    pages.forEach(page => {
        page.style.display = 'none';
    }); // hide all pages
    document.getElementById(pageId).style.display = 'block'; // show the selected page

    const navLinks = document.querySelectorAll('#sidebar a'); // select all sidebar links
    navLinks.forEach(link => {
        link.parentElement.classList.remove('active'); // remove active class from all links
        if (link.getAttribute('onclick') === `showPage('${pageId}')`) { // check if the link corresponds to the current page
            link.parentElement.classList.add('active'); // add active class to the current link
        }
    });
}


