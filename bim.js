    var bim_valueble_nodes = [
        'INPUT'
    ]
    var bim_is_valueble = function (element) {
        return (bim_valueble_nodes.indexOf(element.prop('nodeName')) != -1? true: false);
    };

    var bim_set_page_value = function (node, val) {
         if (typeof (node.attr("b_set")) != 'undefined'){
             eval(node.attr("b_set"));
         }

        if (bim_is_valueble(node)){
            node.val(val);
        } else {
            node.html(val);
        }
    };

    var bim_bind = function (template, o, sandbox, index) {

        index = index || false;
        var t = template.clone();
        for (j in o){
            var node = $(t).find("[bid="+j+"]");
            if (index){
                node.attr("bid_index", index);
            }
            bim_set_page_value(node, o[j]);
            if (bim_is_valueble(node)){
                node.attr("bim_object", template.attr("bim_id"));
                node.on("change", function(){
                    window[$(this).attr("bim_object")][$(this).attr("bid")] = $(this).val();
                });
            }
        }
        watch(o,  function(prop, action, newvalue, oldvalue){
            if (index){
                var node = sandbox.find("[bid="+prop+"][bid_index="+index+"]");
            } else {
                var node = sandbox.find("[bid="+prop+"]");
            }
            bim_set_page_value(node, newvalue);
        });
        sandbox.append(t);

    };
    var bim = function(){
        $("[bim_id]").each(function(indx, element){
            var bid = $(this).attr("bim_id");
            if ((typeof window[bid]) !== "undefined") {
                var template = $("[bim_id="+bid+"]").clone();
                var sandbox  = $("[bim_id="+bid+"]").parent();
                $("[bim_id="+bid+"]").remove();
                if (typeof ($(this).attr('bim_array')) != 'undefined'){
                    for (i in window[bid]){
                        bim_bind(template, window[bid][i], sandbox, i);
                    }
                } else {

                    bim_bind(template, window[bid], sandbox);
                }
            }
        });
    }

// $(document).ready(function(){
// 	var bim = {
// 		containers: {}
// 	}
// 	$("[bim_id]").each(function(elem, idx){
// 		var bid = $(this).attr("bim_id");
// 		if ((typeof window[bid]) !== "undefined") {
// 			bim.containers[bid] = {
// 				template: $(this).clone(),
// 				sandbox: $(this).parent()
// 			};

// 			$("[bim_id="+$(this).attr("bim_id")+"]").remove();

// 			for (i in window[bid]){
// 				var t = bim.containers[bid].template.clone();
// 				var o = window[bid][i];
// 				for (j in o){
// 					$(t).find("[bid="+j+"]").html(o[j]);
// 				}
// 				bim.containers[bid].sandbox.append(t);
// 			}
// 		}
// 	});
// });