
'use strict'

//проверка, если уже есть данные в хранилище
if (localStorage['json'] === undefined || localStorage['json'] === '') {
    var results = {todo:[]}; //глобальный массив объектов
    var mod_results = results; //массив для модификаций
    var options_array = {todo:[]};//массив для уникальных объектов в селекте
} else {
    var results = JSON.parse(localStorage.getItem('json')); //глобальный массив объектов
    var mod_results = results; //массив для модификаций
    var options_array = JSON.parse(localStorage.getItem('json')); //массив для уникальных объектов в селекте
    renderItems(results); //рендерим объекты
}

//объявленяем переменные для элементов
var projects = document.getElementById( "projects" );
var cancel = document.getElementById( "cancel" );
var create = document.getElementById( "create" );
var select = document.getElementById("projects");
var sort = document.getElementById( "priority_sort" );
var editForm = false; //для проверки на редактирование
var change_number; //номер редактируемого объекта

toggleShow('.edit-form'); //прячем форму создания\редктирования
removeItem(); //активируем функцию удаления
removeDuplicatedprojects(options_array); // удаляем дубликомты из маасива
renderProjects(options_array); //добавление проектов в селект

//сабмит формы + запись/редактирование в хранилище
document.addEventListener( "DOMContentLoaded", function() {
    var form = document.getElementById( "form" );
    form.addEventListener( "submit", function( e ) {
        e.preventDefault();
        if (editForm) {
            console.log(results);
            results.todo[change_number].name_todo = document.querySelector('[name="name_todo"]').value;
            results.todo[change_number].name_project = document.querySelector('[name="name_project"]').value;
            results.todo[change_number].name_priority = document.querySelector('[name="name_priority"]').value;
            results.todo[change_number].name_desc = document.querySelector('[name="name_desc"]').value;
            console.log('edit');
            mod_results = results;
            options_array = mod_results;
            editForm = false;
        } else {
            results.todo.push({
                name_todo: document.querySelector('[name="name_todo"]').value,
                name_project: document.querySelector('[name="name_project"]').value,
                name_priority: document.querySelector('[name="name_priority"]').value,
                name_desc: document.querySelector('[name="name_desc"]').value
            });
            console.log('add');
            mod_results = results;
            options_array = mod_results;
            sort.checked = false; //сбрасываем чекбокс
            select.selectedIndex = 0; //сбрасываем селект
        }
        localStorage.setItem('json', JSON.stringify(results)); //сохраняем результат
        toggleShow('#form');
        toggleShow('.edit-form');
        renderItems(results); //рендерим результат
        clearOption(select); //очищаем селект
        removeDuplicatedprojects(options_array); //удаляем повторения в селекте
        renderProjects(options_array); //добавляем данные в селект
        form.reset(); //очищаем форму
    }, false);
});

//событие по клику на добавить объект
create.addEventListener( "click", function( e ) {
    toggleShow('#form');
    toggleShow('.edit-form');
});

//событие по клику на отмену
cancel.addEventListener( "click", function( e ) {
    form.reset();
    toggleShow('#form');
    toggleShow('.edit-form');
});

//сортировка по приоритету
sort.addEventListener( "click", function( e ) {
    sortProjects(projects);
    sortPriority();
});

//вызов сортировки по проектам
projects.addEventListener( "change", function( e ) {
    sortProjects(projects);
});

//показывает или скрывает элемент
function toggleShow(elem) {
    var x = document.querySelector(elem);
    if (x.style.display === "" || x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

//показывает описание
function showDesc() {
    var showDesc = document.getElementsByClassName("btn-show");
    for (var i = 0; i < showDesc.length; i++) {
      showDesc[i].addEventListener('click', function(e) {
        var t = e.target.innerText; //для обновления текста
        var x = e.target.parentNode.parentNode.previousSibling.lastChild.firstChild;
        if (x.style.display === "" || x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
        //меняем текст
        if (t === "Развернуть") {
            e.target.innerText = "Свернуть";
        } else {
            e.target.innerText = "Развернуть";
        }
      });
    }
}

//удалить объект
function removeItem() {
    var remove = document.getElementsByClassName('btn-close')
    for (var i = 0; i < remove.length; i++) {
        remove[i].addEventListener('click', function(e) {
            var delete_number = e.target.parentNode.parentNode.parentNode.attributes.data_id.value;
            e.target.parentNode.parentNode.parentNode.remove();
            var r_result = JSON.parse(localStorage.getItem('json'));
            r_result.todo.splice(delete_number, 1);
            localStorage.setItem('json', JSON.stringify(r_result));
            mod_results = r_result;
            results = r_result;
            options_array = mod_results;
            clearOption(select);
            removeDuplicatedprojects(options_array);
            renderProjects(options_array);
            renderItems(mod_results);
        }, false);
    }
}

//отредактировать объект
function editItem() {
    var change = document.getElementsByClassName('btn-change');
    for (var i = 0; i < change.length; i++) {
        change[i].addEventListener('click', function(e) {
            change_number = Number(e.target.parentNode.parentNode.parentNode.attributes.data_id.value);
            document.getElementById( "name_todo" ).value = e.target.attributes.data_name_todo.value;
            document.getElementById( "name_project" ).value = e.target.attributes.data_name_project.value;
            document.getElementById( "name_priority" ).value = e.target.attributes.data_name_priority.value;
            document.getElementById( "name_desc" ).value = e.target.attributes.data_name_desc.value;
            toggleShow('#form');
            toggleShow('.edit-form');
            editForm = true;
            mod_results = results;
            options_array = mod_results;
        });
    }
}

// рендер объектов
function renderItems(obj) {
    if (obj.todo.length < 1) {
        document.querySelector('.todo-list').innerHTML = '<div class="noresults">Ничего не добавлено</div>';
    } else {
        document.querySelector('.todo-list').innerHTML = '';
        sort.disabled = false;
    }
    for(var i = 0; i < obj.todo.length; i++) {
       var todo_item = '<div class="row"><div class="col-sm-12"><p class="item__name">Название задачи: <span>'+obj.todo[i].name_todo+'</span></p></div></div>'+
                        '<div class="row">'+
                            '<div class="col-sm-6">'+
                                '<p class="item__project">Проект: <span>'+obj.todo[i].name_project+'</span></p>'+
                            '</div>'+
                            '<div class="col-sm-6">'+
                                '<p class="item__priority">Приоритет: <span>'+obj.todo[i].name_priority+'</span></p>'+
                            '</div>'+
                            '<div class="col-sm-12">'+
                                '<p class="item__desc">Описание: <span>'+obj.todo[i].name_desc+'</span></p>'+
                            '</div>'+
                        '</div>'+
                        '<div class="row">'+
                            '<div class="col-sm-2"><button type="button" class="btn btn-warning btn-change" data_name_todo="'+obj.todo[i].name_todo+'" data_name_project="'+obj.todo[i].name_project+'" data_name_priority="'+obj.todo[i].name_priority+'" data_name_desc="'+obj.todo[i].name_desc+'">Изменить</button></div>'+
                            '<div class="col-sm-2"><button type="button" class="btn btn-danger btn-close">Закрыть</button></div>'+
                            '<div class="col-sm-2"><button type="button" class="btn btn-info btn-show">Развернуть</button></div>'+
                        '</div>';
        var div = document.createElement("div");
        div.className = "item";
        div.setAttribute("data_id",i);
        div.innerHTML = todo_item;
        document.querySelector('.todo-list').appendChild(div);
    }
    showDesc();
    removeItem();
    editItem();
}

//сортировка по приоритету
function sortPriority() {
    if (sort.checked) {
        mod_results.todo.sort(sort_by('name_priority', false, parseInt));
        renderItems(mod_results);

    } else {
        sortProjects(projects);
        renderItems(mod_results);
    }
}

//сортировка по значению
function sort_by (field, reverse, primer) {
   var key = primer ?
       function(x) {return primer(x[field])} :
       function(x) {return x[field]};
   reverse = !reverse ? 1 : -1;
   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     }
}

//сортировка по проектам
function filterByProject(arr, proj) {
    return arr.filter(function(item, i, arr) {
        return (item.name_project == proj);
    });
};

//сортировка проектов
function sortProjects(id) {
    var p_results = JSON.parse(localStorage.getItem('json'));
    var project = id.options[id.selectedIndex].value;
    if (project == 'all') {
        mod_results = p_results;
        results = p_results;
        renderItems(p_results);
    } else {
        var filter_projects = filterByProject(p_results.todo, project);
        mod_results = {todo: filter_projects};
        renderItems(mod_results);
    }
}

//генерация проектов для select
function renderProjects(obj) {
    for(var i = 0; i < obj.todo.length; i++) {
        var option = document.createElement("option");
        option.text = obj.todo[i].name_project;
        option.value = obj.todo[i].name_project;
        select.appendChild(option);
    }
}

//удаление повторяющихся элементов в массиве
function removeDuplicatedprojects(array) {
    var opts = [];
    for (var i = 0; i < array.todo.length; i++) {
        if (opts.indexOf(array.todo[i].name_project) >= 0) {
            array.todo.splice(i, 1);
            i--;
        } else {
            opts.push(array.todo[i].name_project);
        }
    }
}

//очишает select, оставяляя дефолтный option
function clearOption(id) {
    for(var i = id.options.length-1;i>0;i--)
    {
        id.removeChild(id.options[i]);
    }
}