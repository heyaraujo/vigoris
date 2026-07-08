document.addEventListener("DOMContentLoaded", () => {

    // 1. COMPORTAMENTO NAVBAR SCROLL
    const navbar = document.getElementById("navbar");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // 2. SISTEMA DE ABAS INTERATIVAS (DETALHAMENTO DE SERVIÇOS)
    const cards = document.querySelectorAll(".portfolio-card");
    const contents = document.querySelectorAll(".details-content");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            // Remove a classe ativa de todos os cards
            cards.forEach(c => c.classList.remove("active"));
            // Adiciona classe ativa apenas no clicado
            card.classList.add("active");

            // Pega o id do serviço associado ao card
            const targetService = card.getAttribute("data-service");

            // Oculta todos os conteúdos com animação sutil
            contents.forEach(content => {
                content.classList.remove("active");
            });

            // Exibe o conteúdo correspondente
            const activeContent = document.getElementById(`details-${targetService}`);
            if (activeContent) {
                activeContent.classList.add("active");
            }
        });
    });
});

// 3. MENU MOBILE (HAMBÚRGUER)
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navMenu = document.querySelector(".nav-menu");

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
        // Alterna a classe 'active' que faz o menu descer
        navMenu.classList.toggle("active");

        // Troca o ícone de hambúrguer para um "X" (fechar)
        const icon = mobileMenuBtn.querySelector("i");
        if (navMenu.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
        } else {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }
    });

    // Fecha o menu automaticamente quando um link for clicado (melhora a experiência no celular)
    const navLinks = navMenu.querySelectorAll("a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            const icon = mobileMenuBtn.querySelector("i");
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        });
    });
}

/* =========================================
   REMOVER PRELOADER APÓS O CARREGAMENTO
========================================= */
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Oculta a tela de carregamento após a página carregar
        // Adicionamos 500ms (meio segundo) apenas para a transição ficar mais suave
        setTimeout(() => {
            preloader.classList.add('preloader-hidden');
        }, 1000); 
    }
});

/* =========================================
   ACEITE DE COOKIES (LGPD)
========================================= */
window.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (cookieBanner && acceptBtn) {
        // Verifica se o usuário já aceitou os cookies no passado
        if (!localStorage.getItem('vigorisCookiesAceitos')) {
            // Se não aceitou, espera 1 segundo e mostra o banner suavemente
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 1000);
        }

        // Ação ao clicar no botão "Aceitar"
        acceptBtn.addEventListener('click', () => {
            // Salva no navegador que o cliente aceitou
            localStorage.setItem('vigorisCookiesAceitos', 'sim');
            // Esconde o banner
            cookieBanner.classList.remove('show');
        });
    }
});