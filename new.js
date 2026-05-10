$(document).ready(function () {    

    const $form = $("#mainForm");
    const $tableBody = $("#formTable tbody");
    const $searchInput = $("#searchInput");
    const $searchColumn = $("#searchColumn");
    const $resetBtn = $("#resetBtn");
    const $searchBtn = $("#searchBtn");
    const $rowsPerPage = $("#rowsPerPage");
    const $paginationContainer = $("#pagination");


    // $rowsPerPage.on("change", function () {
    // rowsPerPage = parseInt($(this).val());
    // currentPage = 1; // reset page
    // loadData();
    // });

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
 

    $searchBtn.on("click", filterData);
    $searchInput.on("input", filterData);
    $searchColumn.on("change", filterData);

    // ================= SORT
    $("#formTable th").on("click", function () {

    let col = $(this).data("col");
    if (!col) return;

    if (sortColumn === col) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
        sortColumn = col;
        sortDirection = "asc";
    }

    updateSortIcons(); // 🔥 add this
    loadData();
    });
    // ================= HIGHLIGHT
   function highlight(text, columnName) {

    let term = $searchInput.val().toLowerCase();
    let selectedColumn = $searchColumn.val();

    if (!term) return text;

    // যদি specific column select করা থাকে
    if (selectedColumn !== "all" && selectedColumn !== columnName) {
        return text; //  অন্য column এ highlight করবে না
    }

    let regex = new RegExp(`(${term})`, "gi");

    return String(text).replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
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
    $(this).find("span").text(isDark ? "Light Mode" : "Dark Mode");
});


// this is the last change commit for jquirey data table addition.

    // INIT
    updateTheme();
    loadData();
});