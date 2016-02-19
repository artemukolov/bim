/*
    lib: Bim
    author: Artem Ukolov
    version: 0.1 alpha
*/
    var bim = {
        keys: {},
        valueble_nodes: ['INPUT'],
        templates: {},
        sandboxes: {},
        sort_array: {},
        generate_key: function () {
            var letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
            var result = '';
            while ((result == '') || (typeof (bim.keys[result]) != "undefined")){
                result = 'k';
                for (var i = 0; i < 12; i++) {
                    result += letters[Math.floor(Math.random() * letters.length)];
                }
            }
            return result;
        },
        is_valueble: function (element) {
            return (bim.valueble_nodes.indexOf(element.prop('nodeName')) != -1? true: false);
        },
        set_page_value: function (node, val) {
            if (typeof (node.attr("b_set")) != 'undefined'){
                eval(node.attr("b_set"));
            }
            if (typeof (node.attr("b_set_attr")) != 'undefined'){
                node.attr(node.attr("b_set_attr"), val);
            } else {
                if (bim.is_valueble(node)){
                    node.val(val);
                } else {
                    node.html(val);
                }
            }
        },
        get_object: function (object_str) {
            var o = window;
            var arr = object_str.split(".");
            for (i in arr){
                o = o[arr[i]];
            }
            return o;
        },
        change_dom: function(object_str, field, index, value){
            for (i in bim.keys){
                var rec = bim.keys[i];
                if ((rec.object == object_str) && (rec.field == field) && (rec.index == index)){
                    bim.set_page_value($("[bim_key="+i+"]"), value);
                }
            }
        },
        change_object: function(key, value){
            var tmp = bim.keys[key];
            if (typeof (tmp) != "undefined"){
                var object = bim.get_object(tmp.object);
                if (tmp.index !== false){
                    object = object[tmp.index];
                };
                object[tmp.field] = value;
            } else {
                console.log("key "+key+" not found");
            }
        },

        bind : function (template, o, sandbox, index) {

            index = index || false;
            var t = template.clone();

            var bim_object = o;//bim.get_object(template.attr("bim_id"));

            if (index) {
                bim_object = bim_object[index];
            }

            for (j in o){

                var key = bim.generate_key();
                bim.keys[key] = {
                    object: template.attr("bim_id"),
                    field: j,
                    index: index
                };


                $(t).find("[bim_field="+j+"]").each(function (indx, node1) {

                    var node = $(this);
                    node.attr("bim_key", key);
                    bim.set_page_value(node, o[j]);
                    if (bim.is_valueble(node)){
                        node.on("change", function(){
                            bim.change_object($(this).attr("bim_key"), $(this).val());
                        });
                    }
                    
                });;
                
            }

            watch(bim_object, function(prop, action, newvalue, oldvalue){

                bim.change_dom(template.attr("bim_id"), prop, index, newvalue);

            });

            sandbox.append(t);

        },

        bind_array: function(template, bim_object, sandbox){

            var temp_arr = [];

            for (i in bim_object){

                var temp_record = bim_object[i];

                temp_record.bim_temp_index = i;

                temp_arr.push(temp_record);

            }

            if (typeof (bim.sort_array[template.attr('bim_id')]) != 'undefined'){

                var sort = bim.sort_array[template.attr('bim_id')];

                sort_function = function(a, b){


                    if (typeof (template.find("[bim_field="+sort.field+"][b_sort_func]").attr('b_sort_func')) != 'undefined'){

                         eval(template.find("[bim_field="+sort.field+"][b_sort_func]").attr('b_sort_func'));
                    
                    } 

                    else {

                        val = a[sort.field]>b[sort.field];

                    }

                    if (sort.reverse){

                        val = !val;

                    }

                    return val;

                }

                temp_arr.sort(sort_function);

            }

            for (i in temp_arr){

                bim.bind(template, bim_object[temp_arr[i].bim_temp_index], sandbox, temp_arr[i].bim_temp_index);

            }

        },

        destroy_keys: function (object_str) {

            for(i in bim.keys){

                if (bim.keys[i].object == object_str){

                    delete(bim.keys[i]);

                }

            }

        },

        unwach_object: function (object_str) {

            unwatch(bim.get_object(object_str), function () {});

        },

        bunch_object: function(Object_id, bim_object){

            var bim_object = bim_object || bim.get_object(Object_id);

            if ((typeof bim_object) !== "undefined"){

                if (typeof (bim.templates[Object_id]) == "undefined"){

                    bim.templates[Object_id] = $("[bim_id='" + Object_id + "']").clone();

                }

                if (typeof (bim.sandboxes[Object_id]) == "undefined"){

                    bim.sandboxes[Object_id] = $("[bim_id='" + Object_id + "']").parent();

                }

                var template = bim.templates[Object_id];

                var sandbox =  bim.sandboxes[Object_id];

                $("[bim_id='" + Object_id + "']").remove();

                if (typeof (template.attr('bim_array')) != 'undefined'){

                    bim.bind_array(template, bim_object, sandbox);

                    watch(bim_object, function (prop, action, newvalue, oldvalue) {

                        if ((action  == "splice") || (action  == "push")){
                      
                            bim.destroy_keys(Object_id);
                      
                            bim.unwach_object(Object_id);
                      
                            bim.bunch_object(Object_id);
                      
                        }

                    });

                } else {

                    bim.bind(template, bim_object, sandbox);

                }

            }

        },

        set_sort: function(object_id, field, reverse){

            bim.sort_array[object_id] = {
                field: field,
                reverse: reverse || false
            };


        },

        get_sort: function(object_id){

            return bim.sort_array[object_id] || false;

        },

        init: function (object_str) {

            object_str = object_str || false;
            if (object_str == false) {
                $("[bim_id]").each(function (indx, element) {
                    bim.bunch_object($(this).attr("bim_id"));
                });
            } else {
                bim.bunch_object(object_str);
            }


        }
    };

