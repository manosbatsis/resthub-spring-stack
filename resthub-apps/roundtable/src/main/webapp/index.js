
/**
 * Routes
 */
(function($) {
	
    var app = $.sammy(function() {
        this.get('#/', function() {
            $('#main').html('<p>Welcome to <strong>Roundtable</strong></p>');
            dominoes("components/poll/list.js", function() {
                $('#main').listPoll("destroy");
            });
        });

        /**
         * View polls.
         */
        this.get('#/poll/list', function(context) {
            dominoes("components/poll/list.js", function() {
                $.ajax({
                    url: 'api/poll/',
                    dataType: 'json',
                    success: function(polls) {
                        $('#main').listPoll({
                            data : {polls : polls},
                            context: context
                        });
                    }
                });
            });
        });

       	
        /**
         * View new poll creation form.
         */
        this.get('#/poll/create', function(context) {
            dominoes("components/poll/edit.js", function() {
                $('#main').editPoll();
            });
        });

        /**
         * View poll.
         */
        this.get('#/poll/:id', function(context) {
            var id = this.params['id'];
            dominoes("components/poll/view.js", function() {
                $.ajax({
                    url: 'api/poll/' + id,
                    dataType: 'json',
                    success: function(poll) {
                        $('#main').viewPoll({
                            data : poll
                        });
                    }
                });
            });
        });

        /**
         * Post a new poll.
         */
        this.post('#/post/poll', function(context) {
            var poll = {
                author: this.params['author'],
                topic: this.params['topic'],
                body: this.params['body'],
                answers: []
            }
            // FIXME found another way...
            var answers = this.target.answers;
            for (i = 0; i < answers.length; i++) {
                poll.answers.push({
                    body:answers[i].value
                });
            }

            $.ajax({
                type: 'POST',
                url: 'api/poll',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                processData: false,
                data: $.toJSON(poll),
                success: function(poll) {
                    $.pnotify('Poll created with success.');
                    context.redirect('#/poll', poll.id);
                }
            });
        });

        /**
         * Search polls.
         */
        this.post('#/post/search', function(context) {
            var q = this.params['query'];

            $.ajax({
                type: 'GET',
                url: 'api/poll/search?q=' + q,
                dataType: 'json',
                success: function(polls) {
                    $.pnotify('Polls found...');
                    dominoes("components/poll/list.js", function() {
                        $('#main').listPoll({
                            data : {polls : polls},
                            context: context
                        });
                    });
                }
            });
        });
    });

    $(function() {
        app.run('#/');
        $('body').ajaxError(function(e, xhr, settings, exception) {
            if (xhr.status == 404) {
                $.pnotify({
                    pnotify_title: 'Resource not found.',
                    pnotify_text: 'No objects found.'
                });
            }
            else {
                $.pnotify({
                    pnotify_title: 'Server trouble!',
                    pnotify_text: 'Error requesting ' + settings.url,
                    pnotify_type: 'error',
                    pnotify_hide: false
                });
            }
        });
        dominoes("components/poll/search.js", function() {
            $('#search').searchPoll();
        });
    });
})(jQuery);
