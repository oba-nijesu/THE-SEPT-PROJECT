<?php
/**
 * Contact form handler for The September Project Managers Ltd.
 * Validates the submission, emails it to the business inbox, and
 * responds to both fetch (JSON) and plain form-post (redirect) clients.
 */

$recipient = 'info@septemberproject.com';

function respond($success, $message, $redirect) {
    $isAjax = (
        (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
        || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
    );

    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['success' => $success, 'message' => $message]);
        exit;
    }

    header('Location: ' . $redirect);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.html');
    exit;
}

// Honeypot: real visitors never fill this hidden field in.
if (!empty($_POST['website'])) {
    respond(true, "Thanks — your request has been received. We'll be in touch shortly.", 'contact.html?sent=1');
}

function fieldValue($key) {
    return isset($_POST[$key]) ? trim(str_replace(["\r", "\n"], '', $_POST[$key])) : '';
}

$fullName = fieldValue('fullName');
$company = fieldValue('company');
$email = fieldValue('email');
$phone = fieldValue('phone');
$service = fieldValue('serviceInterest');
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

if ($fullName === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please fill in your name, a valid email and a message before sending.', 'contact.html?sent=0');
}

$subject = mb_encode_mimeheader('New enquiry from ' . $fullName . ' — September Project Managers site', 'UTF-8');

$body = "New contact form submission\n\n"
    . "Name: $fullName\n"
    . "Company: " . ($company !== '' ? $company : '—') . "\n"
    . "Email: $email\n"
    . "Phone: " . ($phone !== '' ? $phone : '—') . "\n"
    . "Service interested in: " . ($service !== '' ? $service : '—') . "\n\n"
    . "Message:\n$message\n";

$fromDomain = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost';
$fromAddress = 'no-reply@' . $fromDomain;

$replyToName = mb_encode_mimeheader($fullName, 'UTF-8');

$headers = "From: The September Project Managers Site <$fromAddress>\r\n"
    . "Reply-To: $replyToName <$email>\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($recipient, $subject, $body, $headers);

if ($sent) {
    // Best-effort confirmation back to the visitor — failure here shouldn't
    // block the success response, since the business already has the lead.
    $confirmSubject = mb_encode_mimeheader('We received your request — The September Project Managers Ltd', 'UTF-8');
    $confirmBody = "Hi $fullName,\n\n"
        . "Thanks for reaching out to The September Project Managers Ltd. We've received "
        . "your request and someone from our team will be in touch shortly.\n\n"
        . "Here's a copy of what you sent us:\n\n"
        . "Service interested in: " . ($service !== '' ? $service : '—') . "\n"
        . "Message:\n$message\n\n"
        . "Best regards,\n"
        . "The September Project Managers Ltd\n";
    $confirmHeaders = "From: The September Project Managers Ltd <$fromAddress>\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n";
    mail($email, $confirmSubject, $confirmBody, $confirmHeaders);

    respond(true, "Thanks — your request has been received. We'll be in touch shortly.", 'contact.html?sent=1');
} else {
    respond(false, "Sorry, something went wrong sending your request. Please email us directly at $recipient.", 'contact.html?sent=0');
}
