(function($) {
    $(document).ready(function() {

        // The id of the currently selected client
        var client_id = undefined;

        // The name of the currently selected client
        var client_name = undefined;

        // The load timer that automatically refreshed the page
        var load_timer = undefined;

        // Set up AJAX to allow posts
        $.ajaxSetup({ 
             beforeSend: function(xhr, settings) {
                 function getCookie(name) {
                     var cookieValue = null;
                     if (document.cookie && document.cookie != '') {
                         var cookies = document.cookie.split(';');
                         for (var i = 0; i < cookies.length; i++) {
                             var cookie = jQuery.trim(cookies[i]);
                             // Does this cookie string begin with the name we want?
                         if (cookie.substring(0, name.length + 1) == (name + '=')) {
                             cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                             break;
                         }
                     }
                 }
                 return cookieValue;
                 }
                 if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                     // Only send the token to relative URLs i.e. locally.
                     xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                 }
             } 
        });
        
        // Register click handlers on all clients
        var registerClientHandlers = function() {
            $(".person").on("click", function() {
               //change css on selected person
               $(".person_selected").removeClass("person_selected");
               $(".list #"+this.id).addClass("person_selected");
                load_client(this);
            });
        }
		registerClientHandlers();
        
         //Load Client View Into Main Content
        var load_client = function(client_obj) { //FIX: Load Id from client_obj
			var fragment_url = "/fragment/display_client/?";
			if(client_obj){
				fragment_url += "id="+client_obj.id;
			}
			if($("#select_msg") && $("#select_msg").val() == "list") {
				if (fragment_url.length > 26) { //second get vaiable
					fragment_url += "&";
				}
				fragment_url += "list=1";
			}
			$('#main_content').load(fragment_url,function() {load_client_complete(client_obj)})
		}
		load_client();
		
		var load_client_complete = function(client_obj) {
			
			load_message_call_tabs();
			
			 // Change message displays when the user selects the pulldown
			$("#select_msg").on("change", function(e) {
				if($("#select_msg").val() == "list") {
					$(".message-list").load("/fragment/message_list/" + client_obj.id + "/");
				} else {
					$(".message-list").load("/fragment/message/" + client_obj.id + "/");
				}
			});
			
			if(client_obj) {
				client_id = client_obj.id;
				client_name = $(client_obj).find('.name').html();
			}
            
			loadEditHandlers(client_obj);
        }
        
        var load_message_call_tabs = function () {
			 // Swap the boxes in add call when the call completed button is changed
			$('#complete').on('change', function(e) {
				if (this.checked) {
					$('.duration').show();
				} else {
					$('#duration').val('');
					$('.duration').hide();			
				}
			});
			$('.duration').hide();

			$('#clear_call').on('click', function(e) {
				$('#call_notes').val("");
				$('#duration').val('');
				$('#complete').attr('checked', false);
				$('.duration').hide();
			});
			
			// Sets up the characters left view.
			$('#message-box').on('keyup', function(e) {
				var len = $('#message-box').val().length;
				var messages = Math.ceil(len / 144);
				var left = len % 144;
				if (left == 0 && messages > 0) {
					left = 144;
				}
				var str = left + "/144 characters, " + messages + " message";
				if (messages != 1) {
					str += "s";
				}
				$('#chars-left').text(str);
			});
            
            // Send a message when the nurse clicks send
        
			$('.messages #send_message').on("mouseleave", function() {
				$("#send_message").css("background-color", "rgb(91,141,147)");
			});
			
			$('.messages #send_message').on("mousedown", function() {
				$("#send_message").css("background-color", "rgb(217, 233, 236)");
				}).on('mouseup', function() {
				$("#send_message").css("background-color", "rgb(91,141,147)");
				if (client_id === undefined || $(".messages #message-box").val() == "") {
					return;
				}
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (xhr.readyState != 4) {
						return;
					}
					if($("#select_msg").val() == "list") {
						$(".message-list").load("/fragment/message_list/" + client_id + "/");
					} else {
						$(".message-list").load("/fragment/message/" + client_id + "/");
					}
					$(".messages #message-box").val("").keyup();
				}
				xhr.open("POST", "/message/" + client_id + "/", true);
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhr.setRequestHeader("X-CSRFToken", $('input[name="csrfmiddlewaretoken"]').val());
				xhr.send($('#message-box').serialize());
			});

			// Save a call when the nurse clicks save
			 $('.messages #save_call').on("mouseleave", function() {
				$("#save_call").css("background-color", "rgb(91,141,147)");
			});
			
			$('.messages #save_call').on("mousedown", function() {
				$("#save_call").css("background-color", "rgb(217, 233, 236)");
				}).on('mouseup', function() {
				$("#save_call").css("background-color", "rgb(91,141,147)");
				if (client_id == undefined) {
					return;
				}
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (xhr.readyState != 4) {
						return;
					}
					if($("#select_msg").val() == "list") {
						$(".message-list").load("/fragment/message_list/" + client_id + "/");
					} else {
						$(".message-list").load("/fragment/message/" + client_id + "/");
					}
					$('#call_notes').val("");
					$('#duration').val('');
					$('#complete').attr('checked', false);
					$('.duration').hide();
				}
				xhr.open("POST", "/add_call/" + client_id + "/", true);
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhr.setRequestHeader("X-CSRFToken", $('input[name="csrfmiddlewaretoken"]').val());
				xhr.send($('#phone-box').serialize());
			});
			
			create_tabs($('.messages #tabs'));
		}
        
        var load_add_client = function() {
			$('#main_content').load("/add");
		}
        
           // Switch tabs
        var switch_tabs = function(obj) {
            var tabs = $(obj.parents()[2])
            tabs.children('.tab-content').hide();
            tabs.find('.tabs a').removeClass("selected");
            var id = obj.attr("rel");
         
            $('#'+id).show();
            obj.addClass("selected");
         }

		var create_tabs = function(obj) {
			// Hook in tab switching
			obj.find('.tabs a').on('click', function(){
				switch_tabs($(this));
			});
			//Set Default Tabs
			obj.find('.defaulttab').each(function(i,ele){switch_tabs($(ele))});
		}
        create_tabs($('#group-tabs'));

        // Adds a date picker to every field marked as being a date
        var setCalendars = function() {
            $(".date input").each(function(index, element) {
                $(this).datepicker({
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: "yy-mm-dd",
                    maxDate: "+2y",
                    minDate: "-100y",
                    selectOtherMonths: true,
                    showOtherMonths: true,
                    showOn: "button",
                    yearRange: "-100:+2"
                });
            });
        }

        // Create the add client dialog
        $("#signup").dialog({
            autoOpen: false,
            modal: true,
            width: 'auto',
            buttons: {
                "Ok": function() {
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", "/add/", false);
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xhr.setRequestHeader("X-CSRFToken", $('input[name="csrfmiddlewaretoken"]').val());
                    xhr.send($("#add_client_form").serialize());
                    var response = xhr.responseText;
                    if (response.length == 0) {
                        window.location.href = "/";
                    } else {
                        $("#add_client_form").html(response);
                        setCalendars();
                    }
                }
            },
            open: function(event, ui) {
                setCalendars();
            },
            close: function(event, ui) {
                $("#add_client_form").load("/add/");
            }
        });
        $("#add").on("click", function() {
            load_add_client();
        });

        // Refresh the client list page. Why is this here?
        var patientRefresh = function() {
           // load($('.list #' + client_id).get()[0]);
        }

        
        // Load the middle and right panes when a new client is selected. We
        // have to clear the load_timer to avoid race conditions
        var loade = function(link) {
            if (load_timer != undefined) {
                clearInterval(load_timer);
            }
            if (!link) {
                $('.client_list').load("/fragment/list", function() {
                    registerClientHandlers();
                });
                return;
            }
            client_id = link.id;
            client_name = $(link).find('.name').html();

            // Load the client list...
            $('.client_list').load("/fragment/list/", function() {
                registerClientHandlers();
                $(".person").css("background-color", "rgb(217,233,236)");
                $(".person").css("color", "rgb(1,1,1)");
                $(".list #" + client_id).css("background-color", "rgb(91,141,147)");
                $(".list #" + client_id).css("color", "rgb(217,233,236)");
                people = $(".person");
            });
            
            // ...load the message list...
            $('.message_bar .download').html('<a href="/msgcsv/' + client_id + '/">Download</a>');
            if($("#select_msg").val() == "list") {
                $(".message-list").load("/fragment/message_list/" + client_id + "/");
            } else {
                $(".message-list").load("/fragment/message/" + client_id + "/");
            }

            // ...and load the client profile.
            $(".client-profile").load("/detail/" + client_id + "/", function() {
                loadEditHandlers(link);
            });
            $('.name_bar').html(client_name);
            $('.center_bar .download').html('<a href="/clientcsv/' + client_id + '/">Download</a>');
            $('.send-to').html('To: ' + client_name + '(#' + client_id + ')');
            load_timer = setInterval(patientRefresh, 60000);
        }
        // Hook in client selecting...
        
        // ...and make refreshes automatic
        //load_timer = setInterval(patientRefresh, 60000);

        // Set up the asynchronous search
        var people = $('.person');
        var timer = undefined;
        var processor = undefined;
        function filter() {
            if (processor) {
                clearInterval(processor);
            }
            var busy = false, i = 0, step=10;
            var name = $.trim($('#searchtext').val()).toLowerCase();
            processor = setInterval(function() {
                if (!busy) {
                    busy = true;
                    var divs = people.slice(i, i + step);
                    divs.each(function (num) {
                        $(this).show();
                        var e = $(this);
                        var x = e.find('.name').html().toLowerCase();
                        if (x.indexOf(name) < 0) {
                            e.hide();
                        }
                    });
                    i += step;
                    if (i >= people.length) {
                        clearInterval(processor);
                    }
                    busy = false;
                }
            }, 1);
        }
        $('#searchtext').on('keyup', function(e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 27) {
                // Clear on escape
                $('#searchtext').val('');
            }
            filter();
        });

        // Load the client editing fragment when they click edit
        var loadEditHandlers = function(link) {
            $('.info #edit').on("click", function(eventObject) {
                $('.view_buttons').hide();
                $('.edit_buttons').show();
                $('#client_fragment').load("/edit/" + client_id + "/", function() {
                    setCalendars();
                });
                return false;
            });

            // Save the client when they click save
            $('.info #save').on("click", function(eventObject) {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", "/edit/" + client_id + "/", false);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.setRequestHeader("X-CSRFToken", $('input[name="csrfmiddlewaretoken"]').val());
                xhr.send($('#edit_client').serialize());
                var response = xhr.responseText;
                if (response.length == 0) {
                    $('#client_fragment').load("/fragment/" + client_id + "/");
                    $('.edit_buttons').hide();
                    $('.view_buttons').show();
                } else {
                    $('#client_fragment').html(response);
                }
                return false;
            });

            // Return when they click cancel
            $('.info #cancel').on("click", function(eventObject) {
                $('#client_fragment').load('/fragment/' + client_id + '/');
                $('.edit_buttons').hide();
                $('.view_buttons').show();
                return false;
            });

            //toggle the componenet with class msg_body
            $(".info .msg_head").on('click', function() {
                $(this).next(".msg_body").slideToggle(600);
                if ($(this).hasClass('info_expanded')) {
                    $(this).addClass('info_collapsed').removeClass('info_expanded');
                } else {
                    $(this).addClass('info_expanded').removeClass('info_collapsed');
                }
            });

            // Hook in note adding
            $('.info #notes_add').on('click', function() {
                $('.info #note').show();
                $('.info #notes_hide').show();
                $(this).hide();
                return false;
            });

            // Hook in hiding the note form
            $('.info #notes_hide').on('click', function() {
                $('.info #note').hide();
                $('.info #note [name=text]').val('');
                $('.info #notes_add').show();
                $(this).hide();
                return false;
            });

            // Hook in note deleting
            $('.info #notes .delete').each(function(i, e) {
                var pk = $(this).attr('id');
                $(this).on('click', function() {
                    $.post("/delete_note/" + pk + "/", {}, function() {
                        load(link);
                    });
                });
            });

            // Hook in note saving
            $('.info .add_note').on("click", function(eventObject) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState != 4) {
                        return;
                    }
                    load(link);
                }
                xhr.open("POST", "/note/" + client_id + "/", true);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.setRequestHeader("X-CSRFToken", $('input[name="csrfmiddlewaretoken"]').val());
                xhr.send($('#add_note_form').serialize());
            });

            // Hook in visit adding
            $('.info #visit_add').on("click", function(eventObject) {
                $('.info #visit_form_container').show();
                $(this).hide();
                $('.info #visit_hide').show();
                return false;
            });

            // Hook in visit hiding
            $('.info #visit_hide').on("click", function(eventObject) {
                $('.info #visit_form_container').hide();
                $(this).hide();
                $('.info #visit_add').show();
                return false;
            });
            $('.info #visit_form_container').hide();

            // Hook in visit saving
            $('.info #add_visit').on("click", function(eventObject) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState != 4) {
                        return;
                    }
                    load(link);
                }
                xhr.open("POST", "/visit/" + client_id + "/", true);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.setRequestHeader("X-CSRFToken", $('input[name="csrfmiddlewaretoken"]').val());
                xhr.send($('#add_visit_form').serialize());
            });

            // Hook in visit deleting
            $('.info #visits .delete').each(function(i, e) {
                var pk = $(this).attr('id');
                $(this).on('click', function() {
                    $.post("/delete_visit/" + pk + "/", {}, function() {
                        load(link);
                    });
                });
            });
        };
    });
})(jQuery);
