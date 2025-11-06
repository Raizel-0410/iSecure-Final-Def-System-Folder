# TODO: Implement Visitor History Notification Function

## Steps to Complete

- [x] Create `php/utils/notify.php` with `notify_admin_about_visitor_history` function to check visitor history and notify admins/personnel.
- [x] Modify `php/routes/visitation_submit.php` to require `notify.php` and call the function after successful request insertion.
- [ ] Test the notification system by submitting a visitation request for a visitor with existing history.
- [ ] Verify that notifications appear in admin/personnel dashboards.
