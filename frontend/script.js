$(document).ready(function () {
    const API_URL = 'http://localhost:5000/api';

    let cart = [];
    let totalCost = 0;

    const savedCart = localStorage.getItem('cart');
    const savedTotalCost = localStorage.getItem('totalCost');

    if (savedTotalCost) totalCost = parseFloat(savedTotalCost);
    if (savedCart) {
        cart = JSON.parse(savedCart);
        $('.cart-badge').text(cart.length)
        updateCart()
    }

    function loadMenu() {
        $.ajax({
            url: `${API_URL}/menu`,
            method: 'GET',
            success: function (menu) {
                renderMenu(menu);
            },
            error: function (err) {
                console.error("Error loading menu", err);
            }
        });
    }

    function renderMenu(menu) {
        const availableItems = menu.filter(item => item.available);
        const specialItems = availableItems.filter(item => item.special);

        renderSpecialItems(specialItems);
        renderRegularItems(availableItems);
    }

    function renderSpecialItems(items) {
        const $container = $('#special-items-container');
        $container.empty();

        if (items.length === 0) {
            $container.append('<div class="text-center py-5 w-100"><h3>No special items available</h3></div>');
            return;
        }

        for (let i = 0; i < items.length; i += 4) {
            const group = items.slice(i, i + 4);
            const active = i === 0 ? 'active' : '';
            let itemsHtml = group.map(item => `
                <div class="card col-md-3 border-0 shadow-sm rounded-4">
                    <div class="d-flex pt-2 position-relative align-items-center gap-4 p-2">
                        <img alt="${item.title}" src="${item.image}" class="img-thumbnail rounded-circle border-0 shadow-sm" width="80" height="80" style="object-fit: cover;">
                        <div class="d-flex flex-column">
                            <h5 class="card-title text-base font-semibold mb-0">${item.title}</h5>
                            <span class="text-muted small">${item.description || ''}</span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column position-relative">
                        <span class="text-muted mb-0 small">Regular Price</span>
                        <span class="price text-warning fs-5 fw-semibold">₹${item.price}.00</span>
                        <button class="add-to-cart btn btn-warning position-absolute bottom-0 end-0 translate-middle rounded-circle shadow">+</button>
                    </div>
                </div>
            `).join('');

            $container.append(`
                <div class="carousel-item ${active}">
                    <div class="row g-3 gap-2 flex-nowrap overflow-hidden">
                        ${itemsHtml}
                    </div>
                </div>
            `);
        }
    }

    function renderRegularItems(items) {
        const $container = $('#explore-menu-container');
        $container.empty();

        if (items.length === 0) {
            $container.append('<div class="col-12 text-center py-5"><h3>No items currently available</h3></div>');
            return;
        }

        items.forEach(item => {
            $container.append(`
                <div class="col food-item" data-categories="${item.categories}">
                    <div class="card h-100 border-0 shadow-sm rounded-4">
                        <img src="${item.image}" class="card-img-top rounded-top-4" alt="${item.title}" style="height: 200px; object-fit: cover;">
                        <div class="card-body position-relative">
                            <h5 class="card-title fw-bold">${item.title}</h5>
                            <h5 class="card-text price fw-semibold text-warning">₹${item.price}.00</h5>
                            <button class="add-to-cart btn btn-outline-warning position-absolute bottom-0 end-0 translate-middle rounded-circle shadow">+</button>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    loadMenu();

    $(document).on('click', '.add-to-cart', function () {
        let card = $(this).closest('.card');
        let title = card.find('.card-title').first().text();
        let image = card.find('img').attr('src');
        let price = parseFloat(card.find('.price').text().replace('₹', ''));

        cart.push({ title: title, price: price, image: image });
        totalCost += price;

        updateCart();

        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('totalCost', totalCost.toString());

        const $badge = $('.cart-badge');
        $badge.addClass('shake');
        setTimeout(() => $badge.removeClass('shake'), 500);
    });

    function updateCart() {
        $('#cart').empty();
        cart.forEach(function (item, index) {
            $('#cart').append(`
                <li class="d-flex gap-2 align-items-center justify-content-between list-group-item border-0 border-bottom">
                    <div class="mr-2 flex w-25 font-semibold">
                        <img src="${item.image}" class="object-fit-cover rounded-3 border img-thumbnail bg-white shadow-sm h-16 w-16" width="60" height="60">
                    </div>
                    <div class="w-2/3 font-semibold flex items-center capitalize">${item.title}</div>
                    <span class="fw-bold">₹${item.price}</span>
                    <button type="button" class="remove-from-cart btn-close" data-index="${index}" aria-label="Close"></button>
                </li>
            `);
        });

        $('#cart-total').text(`₹${totalCost.toFixed(2)}`);
        $('.cart-badge').text(cart.length);
    }

    $('#cart').on('click', '.remove-from-cart', function () {
        const index = $(this).data('index');
        const removedItem = cart.splice(index, 1)[0];
        totalCost -= removedItem.price;
        updateCart();
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('totalCost', totalCost.toString());
    });

    $(window).scroll(function () {
        $(this).scrollTop() > 0 ? $('.navbar').addClass('bg-body-tertiary shadow-sm') : $('.navbar').removeClass('bg-body-tertiary shadow-sm');
    });

    $('#book form').submit(function (event) {
        event.preventDefault();
        $('.toast').toast('show');
        $('#book form .btn').text('Table Booked');
        $('#book form .btn').prop('disabled', true);
    });

    $(document).on('click', '.filter-btn', function () {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        let dataFilter = $(this).attr('data-filter');
        let $items = $('.food-item');

        $items.removeClass('active').addClass('hide');

        $items.each(function () {
            let categories = $(this).data('categories').split(' ');
            if (dataFilter === 'all' || categories.includes(dataFilter)) {
                $(this).removeClass('hide').addClass('active');
            }
        });
    });

    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('#reserve input[type="date"]');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }

});