CRM.$(document).ready(function ($) {
  Drupal.behaviors.webformManualDirectDebit = {
    attach: function (context, settings) {

      var billingEmailMessages = [];
      var paymentProcessorId = Drupal.settings.webformManualDirectDebit.paymentProcessorId;
      var customGroupId = Drupal.settings.webformManualDirectDebit.customGroupId;

      if (!paymentProcessorId) {
        return false;
      }

        billingMessagesForAllContacts();

      $('[name=civicrm_1_contribution_1_contribution_payment_processor_id]').change(function () {
        billingMessagesForAllContacts();
      });

      $('#edit-civicrm-1-contribution-1-contribution-contribution-page-id').change(function () {
          billingMessagesForAllContacts();
      });

      function billingMessagesForAllContacts() {
        var numberOfContacts = $('[name=number_of_contacts]').val();
        for (var i = 1; i <= numberOfContacts; i++) {
          createMessage(i);
        }
      }

      function createMessage(contactSerialNumber) {
        var isContactDirectDebitMandateFieldsEmpty = $('[name=contact_' + contactSerialNumber + '_number_of_cg' + customGroupId + ']').val() == '0';
        if (isSelectedPaymentProcessorMustHaveMessage() && isContactDirectDebitMandateFieldsEmpty) {
          showErrorMessage(contactSerialNumber);
        } else {
          $('.wf-crm-billing-dd_mandate_contact_' + contactSerialNumber).remove();
          billingEmailMessages[contactSerialNumber] &&
          billingEmailMessages[contactSerialNumber].close &&
          billingEmailMessages[contactSerialNumber].close();
        }

        return false;
      }

      function showErrorMessage(contactSerialNumber) {
        var selectedPage = $('[name=civicrm_1_contribution_1_contribution_contribution_page_id]');
        var extensionErrorMessageBlock = $('.wf-crm-billing-dd_mandate_contact_' + contactSerialNumber);
        var message = Drupal.t('You must enable Direct Debit mandate fieldset for Contact% in order to process transactions.',
          {'Contact%': getContactLabel(contactSerialNumber)});

        var isErrorMessageExist = extensionErrorMessageBlock.length;
        if (!isErrorMessageExist) {
          selectedPage.after(
            '<div class="messages error wf-crm-billing-dd_mandate_contact_' + contactSerialNumber + '">' +
            message +
            ' <button data-contact="' + contactSerialNumber + '">' +
            Drupal.t('Enable It') +
            '</button></div>'
          );

          $('.wf-crm-billing-dd_mandate_contact_' + contactSerialNumber + ' button').click(function () {
            var contact = $(this).data('contact');
            $('select[name=contact_' + contact + '_number_of_cg' + customGroupId + ']').val('1').change();

            return false;
          });
        }

        var isErrorMessageHidden = extensionErrorMessageBlock.is(':hidden');
        if (isErrorMessageHidden) {
          billingEmailMessages[contactSerialNumber] = CRM.alert(message, Drupal.t('Direct Debit Mandate Required'), 'error');
        }
      }

      function getContactLabel(contactSerialNumber) {
        var contactLabel = $('input[name=' + contactSerialNumber + '_webform_label]', '#wf-crm-configure-form').val();
        contactLabel = checkLabelLength(contactLabel);

        return contactLabel
      }

      function checkLabelLength(contactLabel) {
        var maxLabelLength = 40;
        contactLabel = Drupal.checkPlain(contactLabel);
        if (contactLabel.length > maxLabelLength) {
          contactLabel = contactLabel.substr(0, 38) + '...';
        }

        return contactLabel;
      }

      function isSelectedPaymentProcessorMustHaveMessage() {
        var isPaymentProcessorUserSelect = $('[name=civicrm_1_contribution_1_contribution_payment_processor_id]').val() == "create_civicrm_webform_element";
        var isDirectDebitPaymentProcessorInOptionList = 'Direct Debit' == $('[name=civicrm_1_contribution_1_contribution_payment_processor_id] option[value=' + paymentProcessorId + ']').html()
        var isPaymentProcessorEqualDirectDebit = $('[name=civicrm_1_contribution_1_contribution_payment_processor_id]').val() == paymentProcessorId;

        return (isPaymentProcessorUserSelect && isDirectDebitPaymentProcessorInOptionList) || isPaymentProcessorEqualDirectDebit
      }
    }
  }
}(jQuery));
