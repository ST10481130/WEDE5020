document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // =====================================================
    // 1. NAVIGATION: ACTIVE PAGE
    // =====================================================

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    const navigationLinks = document.querySelectorAll("body > ul a");

    navigationLinks.forEach(function (link) {
        const linkPage = (link.getAttribute("href") || "")
            .split("/")
            .pop()
            .split("#")[0];

        if (linkPage === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
        }
    });


    // =====================================================
    // 2. SMOOTH SCROLLING
    // =====================================================

    document.documentElement.style.scrollBehavior = "smooth";


    // =====================================================
    // 3. SCROLL REVEAL ANIMATIONS
    // =====================================================

    const revealElements = document.querySelectorAll(
        "main h1, main h2, main h3, main p, main img, main li, main section"
    );

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1
            }
        );

        revealElements.forEach(function (element) {
            element.classList.add("reveal");
            revealObserver.observe(element);
        });
    } else {
        // Fallback for browsers without IntersectionObserver.
        revealElements.forEach(function (element) {
            element.classList.add("visible");
        });
    }


    // =====================================================
    // 4. SERVICES PAGE: SEARCH AND SORTING
    // =====================================================

    const headings = document.querySelectorAll("main h2");

    let serviceHeading = null;

    headings.forEach(function (heading) {
        if (heading.textContent.toLowerCase().includes("pricelist")) {
            serviceHeading = heading;
        }
    });

    if (serviceHeading) {
        const serviceList = serviceHeading.nextElementSibling;

        if (serviceList && serviceList.tagName === "UL") {
            serviceList.classList.add("service-list");

            const serviceItems = Array.from(serviceList.children).filter(
                function (item) {
                    return item.tagName === "LI";
                }
            );

            if (serviceItems.length > 0) {
                const controls = document.createElement("div");
                controls.className = "service-controls";

                const searchLabel = document.createElement("label");
                searchLabel.setAttribute("for", "service-search");
                searchLabel.textContent = "Search services";

                const searchInput = document.createElement("input");
                searchInput.type = "search";
                searchInput.id = "service-search";
                searchInput.placeholder = "Search for a service...";
                searchInput.setAttribute(
                    "aria-label",
                    "Search hair services"
                );

                const sortLabel = document.createElement("label");
                sortLabel.setAttribute("for", "service-sort");
                sortLabel.textContent = "Sort services";

                const sortSelect = document.createElement("select");
                sortSelect.id = "service-sort";
                sortSelect.setAttribute(
                    "aria-label",
                    "Sort hair services"
                );

                const sortOptions = [
                    { value: "default", text: "Default order" },
                    { value: "low-high", text: "Price: low to high" },
                    { value: "high-low", text: "Price: high to low" },
                    { value: "a-z", text: "Name: A to Z" }
                ];

                sortOptions.forEach(function (optionData) {
                    const option = document.createElement("option");
                    option.value = optionData.value;
                    option.textContent = optionData.text;
                    sortSelect.appendChild(option);
                });

                const resultCount = document.createElement("p");
                resultCount.className = "service-result-count";
                resultCount.setAttribute("aria-live", "polite");

                controls.appendChild(searchLabel);
                controls.appendChild(searchInput);
                controls.appendChild(sortLabel);
                controls.appendChild(sortSelect);

                serviceHeading.insertAdjacentElement(
                    "afterend",
                    controls
                );

                controls.insertAdjacentElement(
                    "afterend",
                    resultCount
                );

                const originalOrder = serviceItems.slice();

                function getServicePrice(item) {
                    const text = item.textContent;
                    const match = text.match(
                        /R\s?([\d,]+(?:\.\d{1,2})?)/
                    );

                    if (!match) {
                        return Number.MAX_SAFE_INTEGER;
                    }

                    return Number(match[1].replace(/,/g, ""));
                }

                function updateServices() {
                    const searchTerm = searchInput.value
                        .trim()
                        .toLowerCase();

                    const sortMode = sortSelect.value;

                    let visibleItems = serviceItems.filter(function (item) {
                        return item.textContent
                            .toLowerCase()
                            .includes(searchTerm);
                    });

                    if (sortMode === "low-high") {
                        visibleItems.sort(function (a, b) {
                            return getServicePrice(a) - getServicePrice(b);
                        });
                    } else if (sortMode === "high-low") {
                        visibleItems.sort(function (a, b) {
                            return getServicePrice(b) - getServicePrice(a);
                        });
                    } else if (sortMode === "a-z") {
                        visibleItems.sort(function (a, b) {
                            return a.textContent.localeCompare(
                                b.textContent
                            );
                        });
                    } else {
                        visibleItems.sort(function (a, b) {
                            return originalOrder.indexOf(a) -
                                originalOrder.indexOf(b);
                        });
                    }

                    serviceItems.forEach(function (item) {
                        item.hidden = !visibleItems.includes(item);
                    });

                    visibleItems.forEach(function (item) {
                        serviceList.appendChild(item);
                    });

                    resultCount.textContent =
                        visibleItems.length +
                        (visibleItems.length === 1
                            ? " service found."
                            : " services found.");
                }

                searchInput.addEventListener("input", updateServices);
                sortSelect.addEventListener("change", updateServices);

                updateServices();
            }
        }
    }


    // =====================================================
    // 5. GALLERY: ACCESSIBLE LIGHTBOX
    // =====================================================

    // Add the class "gallery-image" to the nine images on gallery.html.
    const galleryImages = Array.from(
        document.querySelectorAll("img.gallery-image")
    );

    if (galleryImages.length > 0) {
        const lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.id = "salon-lightbox";
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.setAttribute("aria-label", "Image gallery");
        lightbox.hidden = true;

        const lightboxContent = document.createElement("div");
        lightboxContent.className = "lightbox-content";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "lightbox-close";
        closeButton.textContent = "×";
        closeButton.setAttribute("aria-label", "Close image gallery");

        const previousButton = document.createElement("button");
        previousButton.type = "button";
        previousButton.className = "lightbox-previous";
        previousButton.textContent = "‹";
        previousButton.setAttribute("aria-label", "Previous image");

        const lightboxImage = document.createElement("img");
        lightboxImage.className = "lightbox-image";
        lightboxImage.alt = "";

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "lightbox-next";
        nextButton.textContent = "›";
        nextButton.setAttribute("aria-label", "Next image");

        const imageCaption = document.createElement("p");
        imageCaption.className = "lightbox-caption";
        imageCaption.setAttribute("aria-live", "polite");

        lightboxContent.appendChild(closeButton);
        lightboxContent.appendChild(previousButton);
        lightboxContent.appendChild(lightboxImage);
        lightboxContent.appendChild(nextButton);
        lightboxContent.appendChild(imageCaption);
        lightbox.appendChild(lightboxContent);
        document.body.appendChild(lightbox);

        let currentImageIndex = 0;
        let previouslyFocusedImage = null;

        function showGalleryImage(index) {
            currentImageIndex =
                (index + galleryImages.length) % galleryImages.length;

            const selectedImage = galleryImages[currentImageIndex];

            lightboxImage.src = selectedImage.currentSrc ||
                selectedImage.src;

            lightboxImage.alt = selectedImage.alt || "Salon hairstyle";

            imageCaption.textContent =
                (selectedImage.alt || "Salon hairstyle") +
                " (" +
                (currentImageIndex + 1) +
                " of " +
                galleryImages.length +
                ")";

            const hasMultipleImages = galleryImages.length > 1;

            previousButton.hidden = !hasMultipleImages;
            nextButton.hidden = !hasMultipleImages;
        }

        function openLightbox(index) {
            previouslyFocusedImage = document.activeElement;

            showGalleryImage(index);

            lightbox.hidden = false;
            lightbox.classList.add("lightbox-open");
            document.body.style.overflow = "hidden";

            closeButton.focus();
        }

        function closeLightbox() {
            lightbox.hidden = true;
            lightbox.classList.remove("lightbox-open");
            document.body.style.overflow = "";

            if (
                previouslyFocusedImage &&
                typeof previouslyFocusedImage.focus === "function"
            ) {
                previouslyFocusedImage.focus();
            }
        }

        galleryImages.forEach(function (image, index) {
            image.classList.add("gallery-clickable");

            image.setAttribute("tabindex", "0");
            image.setAttribute("role", "button");
            image.setAttribute(
                "aria-label",
                "Open image: " + (image.alt || "Salon hairstyle")
            );

            image.addEventListener("click", function () {
                openLightbox(index);
            });

            image.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(index);
                }
            });
        });

        closeButton.addEventListener("click", closeLightbox);

        previousButton.addEventListener("click", function () {
            showGalleryImage(currentImageIndex - 1);
        });

        nextButton.addEventListener("click", function () {
            showGalleryImage(currentImageIndex + 1);
        });

        lightbox.addEventListener("click", function (event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (lightbox.hidden) {
                return;
            }

            if (event.key === "Escape") {
                closeLightbox();
            } else if (event.key === "ArrowRight") {
                showGalleryImage(currentImageIndex + 1);
            } else if (event.key === "ArrowLeft") {
                showGalleryImage(currentImageIndex - 1);
            } else if (event.key === "Tab") {
                // Keep keyboard focus within the lightbox.
                const focusableElements = [
                    closeButton,
                    previousButton,
                    nextButton
                ].filter(function (element) {
                    return !element.hidden;
                });

                const firstElement = focusableElements[0];
                const lastElement =
                    focusableElements[focusableElements.length - 1];

                if (
                    event.shiftKey &&
                    document.activeElement === firstElement
                ) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === lastElement
                ) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }


    // =====================================================
    // 6. ABOUT PAGE: ACCORDION
    // =====================================================

    const accordionHeadings = document.querySelectorAll(
        ".accordion-heading"
    );

    accordionHeadings.forEach(function (heading, index) {
        const content = heading.nextElementSibling;

        if (!content || !content.classList.contains("accordion-content")) {
            return;
        }

        const panelId = "accordion-panel-" + (index + 1);

        content.id = content.id || panelId;

        // Support existing h2 headings without requiring a new HTML structure.
        heading.setAttribute("role", "button");
        heading.setAttribute("tabindex", "0");
        heading.setAttribute("aria-controls", content.id);

        const initiallyOpen =
            heading.getAttribute("aria-expanded") === "true";

        heading.setAttribute(
            "aria-expanded",
            initiallyOpen ? "true" : "false"
        );

        content.hidden = !initiallyOpen;

        function toggleAccordion() {
            const isExpanded =
                heading.getAttribute("aria-expanded") === "true";

            heading.setAttribute(
                "aria-expanded",
                isExpanded ? "false" : "true"
            );

            content.hidden = isExpanded;
        }

        heading.addEventListener("click", toggleAccordion);

        heading.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleAccordion();
            }
        });
    });


    // =====================================================
    // 7. CONTACT FORM: VALIDATION AND EMAIL DRAFT
    // =====================================================

    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!contactForm.reportValidity()) {
                return;
            }

            const nameField = contactForm.querySelector(
                '[name="name"]'
            );

            const emailField = contactForm.querySelector(
                '[name="email"]'
            );

            const phoneField = contactForm.querySelector(
                '[name="phone"]'
            );

            const messageTypeField = contactForm.querySelector(
                '[name="messageType"]'
            );

            const messageField = contactForm.querySelector(
                '[name="message"]'
            );

            const name = nameField ? nameField.value.trim() : "";
            const email = emailField ? emailField.value.trim() : "";
            const phone = phoneField ? phoneField.value.trim() : "";
            const messageType = messageTypeField
                ? messageTypeField.value
                : "";
            const message = messageField
                ? messageField.value.trim()
                : "";

            if (name.length < 2) {
                alert("Please enter your full name.");
                if (nameField) nameField.focus();
                return;
            }

            if (message.length < 5) {
                alert("Please enter a message with at least 5 characters.");
                if (messageField) messageField.focus();
                return;
            }

            if (
                phone &&
                !/^[+()\d\s-]{7,20}$/.test(phone)
            ) {
                alert("Please enter a valid contact number.");
                if (phoneField) phoneField.focus();
                return;
            }

            const recipient = "info@installationsbytsakani.co.za";

            const subject = "Website Contact - " + name;

            const body = [
                "Name: " + name,
                "Email: " + email,
                "Phone: " + (phone || "Not provided"),
                "Message type: " + (messageType || "General enquiry"),
                "",
                "Message:",
                message
            ].join("\n");

            const mailtoLink =
                "mailto:" + recipient +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(body);

            alert(
                "Your email application will open with your message. " +
                "Please review it and press Send to submit your enquiry."
            );

            window.location.href = mailtoLink;
        });
    }


    // =====================================================
    // 8. ENQUIRY FORM: PRICE CALCULATOR AND VALIDATION
    // =====================================================

    const enquiryForm = document.getElementById("enquiryForm");

    if (enquiryForm) {
        const servicePrices = {
            "Hair Installations": 200,
            "Hair Styling": 300,
            "Bridal Installation": 800,
            "Hair Revamp": 100,
            "Lace Cleaning": 50
        };

        const serviceField = enquiryForm.querySelector(
            '[name="service"]'
        );

        const quantityField = enquiryForm.querySelector(
            '[name="quantity"]'
        );

        const nameField = enquiryForm.querySelector(
            '[name="name"]'
        );

        const emailField = enquiryForm.querySelector(
            '[name="email"]'
        );

        const phoneField = enquiryForm.querySelector(
            '[name="phone"]'
        );

        const dateField = enquiryForm.querySelector(
            '[name="date"]'
        );

        const notesField = enquiryForm.querySelector(
            '[name="notes"]'
        );

        const resultMessage = enquiryForm.querySelector(
            ".enquiry-result"
        );

        // Set the minimum booking date to today's local date.
        if (dateField) {
            const today = new Date();
            const localYear = today.getFullYear();
            const localMonth = String(
                today.getMonth() + 1
            ).padStart(2, "0");
            const localDay = String(
                today.getDate()
            ).padStart(2, "0");

            dateField.min =
                localYear + "-" + localMonth + "-" + localDay;
        }

        function formatRand(amount) {
            return "R" + amount.toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function calculateEstimate() {
            if (!serviceField || !quantityField || !resultMessage) {
                return;
            }

            const selectedService = serviceField.value;
            const quantity = Number(quantityField.value);

            if (
                !selectedService ||
                !servicePrices[selectedService] ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 20
            ) {
                resultMessage.textContent =
                    "Select a service and quantity to see your estimate.";
                return;
            }

            const price = servicePrices[selectedService];
            const total = price * quantity;

            resultMessage.textContent =
                "Estimated total: " + formatRand(total) +
                " (" + formatRand(price) + " per service × " +
                quantity + "). Final pricing can be confirmed by the salon.";
        }

        if (serviceField) {
            serviceField.addEventListener(
                "change",
                calculateEstimate
            );
        }

        if (quantityField) {
            quantityField.addEventListener(
                "input",
                calculateEstimate
            );
            quantityField.addEventListener(
                "change",
                calculateEstimate
            );
        }

        calculateEstimate();

        enquiryForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!enquiryForm.reportValidity()) {
                return;
            }

            const name = nameField ? nameField.value.trim() : "";
            const email = emailField ? emailField.value.trim() : "";
            const phone = phoneField ? phoneField.value.trim() : "";
            const selectedService = serviceField
                ? serviceField.value
                : "";
            const quantity = quantityField
                ? Number(quantityField.value)
                : 0;
            const date = dateField ? dateField.value : "";
            const notes = notesField ? notesField.value.trim() : "";

            if (name.length < 2) {
                alert("Please enter your full name.");
                if (nameField) nameField.focus();
                return;
            }

            if (phone && !/^[+()\d\s-]{7,20}$/.test(phone)) {
                alert("Please enter a valid contact number.");
                if (phoneField) phoneField.focus();
                return;
            }

            if (!servicePrices[selectedService]) {
                alert("Please select a valid salon service.");
                if (serviceField) serviceField.focus();
                return;
            }

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 20
            ) {
                alert("Please select a quantity between 1 and 20.");
                if (quantityField) quantityField.focus();
                return;
            }

            const total = servicePrices[selectedService] * quantity;

            const recipient = "info@installationsbytsakani.co.za";
            const subject = "Salon Booking Enquiry - " + name;

            const body = [
                "New salon booking enquiry",
                "",
                "Customer name: " + name,
                "Email: " + email,
                "Phone: " + (phone || "Not provided"),
                "Service: " + selectedService,
                "Quantity: " + quantity,
                "Price per service: " +
                    formatRand(servicePrices[selectedService]),
                "Estimated total: " + formatRand(total),
                "Preferred date: " + (date || "Not specified"),
                "",
                "Additional notes:",
                notes || "None",
                "",
                "Please confirm availability and final pricing."
            ].join("\n");

            const mailtoLink =
                "mailto:" + recipient +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(body);

            alert(
                "Your email application will open with your booking " +
                "enquiry. Review the details and press Send to submit it."
            );

            window.location.href = mailtoLink;
        });
    }


    // =====================================================
    // 9. FOOTER: AUTOMATIC COPYRIGHT YEAR
    // =====================================================

    const currentYear = new Date().getFullYear();

    document.querySelectorAll("footer").forEach(function (footer) {
        const textNodes = Array.from(footer.querySelectorAll("p"));

        textNodes.forEach(function (paragraph) {
            if (/©\s*\d{4}/.test(paragraph.textContent)) {
                paragraph.textContent = paragraph.textContent.replace(
                    /©\s*\d{4}/,
                    "© " + currentYear
                );
            }
        });
    });

});


// =========================================================
// 10. CONTACT PAGE: LEAFLET INTERACTIVE MAP
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const mapContainer = document.getElementById("salon-map");

    // Do not run the map code on pages without a map container.
    if (!mapContainer) {
        return;
    }

    // Make sure the Leaflet library has loaded.
    if (typeof L === "undefined") {
        console.error(
            "Leaflet has not loaded. Check the Leaflet script link."
        );

        mapContainer.textContent =
            "The interactive map could not load. Please check your internet connection.";

        return;
    }

    // Installations By Tsakani salon coordinates.
    const salonLatitude = -24.72044;
    const salonLongitude = 31.21335;

    const map = L.map(mapContainer).setView(
        [salonLatitude, salonLongitude],
        16
    );

    // Display OpenStreetMap map tiles.
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">' +
                "OpenStreetMap</a> contributors",
            maxZoom: 19
        }
    ).addTo(map);

    // Add a marker for the salon.
    const salonMarker = L.marker([
        salonLatitude,
        salonLongitude
    ]).addTo(map);

    salonMarker.bindPopup(
        "<strong>Installations By Tsakani</strong><br>" +
        "Thulamahashe, South Africa<br>" +
        "Wig Installations and Hair Styling"
    );

    salonMarker.openPopup();

    // Make the map accessible to other scripts if needed.
    window.salonMap = map;
});