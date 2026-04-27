$(document).ready(function () {

    const $form = $("#mainForm");
    const $tableBody = $("#formTable tbody");
    const $searchInput = $("#searchInput");
    const $searchColumn = $("#searchColumn");
    const $resetBtn = $("#resetBtn");
    const $searchBtn = $("#searchBtn");
    const $rowsPerPage = $("#rowsPerPage");
    const $paginationContainer = $("#pagination");


    $rowsPerPage.on("change", function () {
    rowsPerPage = parseInt($(this).val());
    currentPage = 1; // reset page
    loadData();
    });

    $resetBtn.on("click", function () {
        $searchInput.val("");
        $searchColumn.val("all");

        currentPage = 1;
        loadData(); // full data show করবে
    });



    $("input, select").on("input change", function () {
        $(this).removeClass("border-red-500");
        const name = $(this).attr("name");
        $(`#${name}Error`).addClass("hidden");
    });

    let editIndex = null;
    let sortColumn = null;
    let sortDirection = "asc";
    let currentPage = 1;
    let rowsPerPage = 5;

    // ================= LOAD DATA
    function loadData() {
        let data = JSON.parse(localStorage.getItem("formData")) || [];
        renderTable(data);
    }

    // LOAD করার সময়
    rowsPerPage = parseInt(localStorage.getItem("rowsPerPage")) || 5;
    $("#rowsPerPage").val(rowsPerPage);

    // CHANGE হলে save করো
    $rowsPerPage.on("change", function () {
    rowsPerPage = parseInt($(this).val());
    localStorage.setItem("rowsPerPage", rowsPerPage);
    currentPage = 1;
    loadData();
    });





    // ================= FORM SUBMIT
    $form.on("submit", function (e) {
        e.preventDefault();

        let isValid = true;

        $("p[id$='Error']").addClass("hidden");
        $("input, select").removeClass("border-red-500");

        function setError(name, message) {
            $(`[name="${name}"]`).addClass("border-red-500");
            $(`#${name}Error`).text(message).removeClass("hidden");
            isValid = false;
        }

        if (!$("[name='name']").val().trim()) setError("name", "Name is required*");
        if (!$("[name='facebook']").val().trim()) setError("facebook", "Facebook is required*");
        if (!$("[name='phone']").val().trim()) setError("phone", "Phone is required*");
        if (!$("[name='address']").val().trim()) setError("address", "Address is required*");
        if (!$("[name='email']").val().trim()) setError("email", "Email is required");

        if (!$("[name='Division']").val()) setError("Division", "Please select a Division*");

        if (!$("input[name='class']:checked").val()) {
            $("#classError").text("Select a department").removeClass("hidden");
            isValid = false;
        }

        if (!$("input[name='Discord']:checked").val()) {
            $("#DiscordError").text("Select an option").removeClass("hidden");
            isValid = false;
        }

        if (!isValid) return;

        const newData = {
            name: $("[name='name']").val(),
            department: $("input[name='class']:checked").val(),
            facebook: $("[name='facebook']").val(),
            phone: $("[name='phone']").val(),
            address: $("[name='address']").val(),
            discord: $("input[name='Discord']:checked").val(),
            email: $("[name='email']").val(),
            Division: $("[name='Division']").val()
        };

        let data = JSON.parse(localStorage.getItem("formData")) || [];

        if (editIndex !== null) {
            data[editIndex] = newData;
            editIndex = null;
        } else {
            data.push(newData);
        }

        localStorage.setItem("formData", JSON.stringify(data));

        $form[0].reset();
        loadData();
    });












    // ================= RENDER TABLE
    function renderTable(data) {

        if (sortColumn) {
            data.sort((a, b) => {
                let A = String(a[sortColumn] || "").toLowerCase();
                let B = String(b[sortColumn] || "").toLowerCase();
                return sortDirection === "asc"
                    ? A.localeCompare(B)
                    : B.localeCompare(A);
            });
        }

        let start = (currentPage - 1) * rowsPerPage;
        let paginated = data.slice(start, start + rowsPerPage);

        $tableBody.empty();

        if (paginated.length === 0) {
            $tableBody.append(`<tr><td colspan="9" class="text-center py-4">No data found</td></tr>`);
        }

        let end = start + paginated.length;

        $("#rowInfo").text(`${data.length === 0 ? 0 : start + 1} - ${end} of ${data.length}`);






        $.each(paginated, function (i, item) {

            let realIndex = start + i;

            let row = `
                <tr>
                    <td class="px-4 py-2">${highlight(item.name)}</td>
                    <td class="px-4 py-2">${item.department}</td>
                    <td class="px-4 py-2">${item.facebook}</td>
                    <td class="px-4 py-2 whitespace-nowrap">${item.phone}</td>
                    <td class="px-4 py-2">${item.address}</td>
                    <td class="px-4 py-2">${item.discord}</td>
                    <td class="px-4 py-2">${highlight(item.email)}</td>
                    <td class="px-4 py-2">${item.Division}</td>
                    <td class="px-4 py-2 text-center whitespace-nowrap">
                        <button class="edit-btn bg-green-400 text-white px-2 py-1 rounded" data-index="${realIndex}">Edit</button>
                        <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-index="${realIndex}">Delete</button>
                    </td>
                </tr>
            `;

            $tableBody.append(row);
        });

        renderPagination(data.length);
    }

    // ================= DELETE

    
    $tableBody.on("click", ".delete-btn", function () {

         if (!confirm("Are you sure to delete?")) return;

    let index = $(this).data("index");
    let data = JSON.parse(localStorage.getItem("formData")) || [];

    // 🔥 যদি edit mode এ থাকে এবং একই item delete হয়
    if (editIndex === index) {
        $form[0].reset();
        editIndex = null;
    }

    // 🔥 যদি delete করা index editIndex এর আগে হয় → index shift fix
    if (editIndex !== null && index < editIndex) {
        editIndex--;
    }

    data.splice(index, 1);
    localStorage.setItem("formData", JSON.stringify(data));

    loadData();

   
});



    // ================= EDIT
    $tableBody.on("click", ".edit-btn", function () {

        let index = $(this).data("index");
        let data = JSON.parse(localStorage.getItem("formData")) || [];
        let item = data[index];

        $("[name='name']").val(item.name);
        $("[name='facebook']").val(item.facebook);
        $("[name='phone']").val(item.phone);
        $("[name='address']").val(item.address);
        $("[name='email']").val(item.email);
        $("[name='Division']").val(item.Division);

        $(`input[name="class"][value="${item.department}"]`).prop("checked", true);
        $(`input[name="Discord"][value="${item.discord}"]`).prop("checked", true);

        editIndex = index;

        $("html, body").animate({ scrollTop: 0 }, 500);
    });

    // ================= SEARCH
    function filterData() {
        let text = $searchInput.val().toLowerCase();
        let column = $searchColumn.val();

        let data = JSON.parse(localStorage.getItem("formData")) || [];

        let filtered = data.filter(item => {
            if (column === "all") {
                return Object.values(item).some(val =>
                    String(val || "").toLowerCase().includes(text)
                );
            } else {
                return String(item[column] || "").toLowerCase().includes(text);
            }
        });

        currentPage = 1;
        renderTable(filtered);
    }

    $searchBtn.on("click", filterData);
    $searchInput.on("input", filterData);
    $searchColumn.on("change", filterData);

    // ================= SORT
    $("#formTable th").on("click", function () {
        let col = $(this).data("col");

        if (!col || col === "action") return;

        if (sortColumn === col) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortColumn = col;
            sortDirection = "asc";
        }

        loadData();
    });

    // ================= PAGINATION
    function renderPagination(total) {
    $paginationContainer.empty();

    let totalPages = Math.ceil(total / rowsPerPage);

    // ===== PREVIOUS BUTTON
    let prevBtn = $(`<button class="px-3 py-1 border rounded bg-gray-200 mr-2">Prev</button>`);

    prevBtn.prop("disabled", currentPage === 1);

    prevBtn.on("click", function () {
        if (currentPage > 1) {
            currentPage--;
            loadData();
        }
    });

    $paginationContainer.append(prevBtn);

    // ===== PAGE NUMBERS
    for (let i = 1; i <= totalPages; i++) {
        let btn = $(`<button class="px-3 py-1 border rounded mx-1 ${i === currentPage ? 'bg-blue-500 text-white' : ''}">${i}</button>`);

        btn.on("click", function () {
            currentPage = i;
            loadData();
        });

        $paginationContainer.append(btn);
    }

    // ===== NEXT BUTTON
    let nextBtn = $(`<button class="px-3 py-1 border rounded bg-gray-200 ml-2">Next</button>`);

    nextBtn.prop("disabled", currentPage === totalPages);

    nextBtn.on("click", function () {
        if (currentPage < totalPages) {
            currentPage++;
            loadData();
        }
    });

    $paginationContainer.append(nextBtn);
}
    // ================= HIGHLIGHT
    function highlight(text) {
        let term = $searchInput.val();
        if (!term) return text;

        let regex = new RegExp(`(${term})`, "gi");
        return String(text).replace(regex, `<mark class="bg-yellow-200">$1</mark>`);
    }


    // ================= THEME INIT (page reload এ remember করবে)
function updateTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        $("html").addClass("dark");
        $("#themeToggle").text("Light Mode");
    } else {
        $("html").removeClass("dark");
        $("#themeToggle").text("Dark Mode");
    }
}

// ================= TOGGLE BUTTON
$("#themeToggle").on("click", function () {

    $("html").toggleClass("dark");

    const isDark = $("html").hasClass("dark");

    // save to localStorage
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // change button text
    $(this).text(isDark ? "Light Mode" : "Dark Mode");
});




    // INIT
    updateTheme();
    loadData();
});