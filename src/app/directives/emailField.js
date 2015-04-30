
angular.module("proton.emailField", [])

.constant("EMAIL_REGEXP",
  /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i
)

.directive('emailField', function ($timeout, $interval, Contact, EMAIL_REGEXP) {
  var self = this;
  var directive = {
    restrict: "A",
    require: 'ngModel',
    link: function ( $scope, $element, $attrs, $ctrl ) {
      var $$element = $($element[0]);
      var parent = $$element.parent();

      $ctrl.$render = function () {
        _(($ctrl.$viewValue || "").split(","))
          .map(function (str) { return str.trim(); })
          .each(function (email) {
            manager.tagsManager('pushTag', email);
          })
      };

      var positionInput = function (argument) {
        var tt = $$element.closest(".twitter-typeahead");
        tt.appendTo(tt.parent());
      };

      var setValue = function () {
        $ctrl.$setViewValue(_(manager.tagsManager('tags').concat([$$element.val()]))
          .map(function (element) { return element.trim(); })
          .filter(function (data) {
            return data && EMAIL_REGEXP.test(data);
          })
          .unique()
          .value()
          .join(",")
        );
        $scope.$apply();
      }

      $timeout(positionInput, 0);

      var emails = [];
      var tabbing = false;

      var manager = $$element.tagsManager({
        tagsContainer: parent[0],
        tagCloseIcon: "<i class=\"fa fa-times\">",
        delimiters: [32, 44],
        prefilled: 'hello',
        validator: function (input) {
          return EMAIL_REGEXP.test(input);
        }
      });

      manager.on("tm:pushed", function (ev, tag) {
        positionInput();
        if (!tabbing) {
          $$element.focus();
        }
        tabbing = false;
        setValue();
      });
      manager.on("tm:popped tm:spliced", setValue);

      $$element
        .on("keydown", function (e) {
          if (e.which === 9) {
            tabbing = true;
          }
        })
        .on("blur", function () {
          var val = $$element.val();
          if (val.length > 0) {
            manager.tagsManager("pushTag", val);
          }

          $timeout(function () { $$element.val(""); }, 0);
        })
        .on("change", setValue)
        .typeahead(null, {
          source: Contact.index.ttAdapter(),
          templates: {
              suggestion: function(Contact) {
                  return "<b>" +Contact.ContactName + "</b><br>" + Contact.ContactEmail;
                }
            }
        }).on("typeahead:selected", function (e, d) {
          manager.tagsManager("pushTag", d.ContactEmail);
        });

      $$element.autosizeInput();
    }
  };

  return directive;
});
