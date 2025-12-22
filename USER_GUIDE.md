# Client Enquiry CRM System - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Enquiry Management](#enquiry-management)
4. [Dashboards](#dashboards)
5. [Payment Tracking](#payment-tracking)
6. [User Roles](#user-roles)
7. [Best Practices](#best-practices)

## Introduction

The Client Enquiry CRM System is a comprehensive web-based application designed for legal practices to manage client enquiries from initial contact through conversion and payment. The system provides automated ID generation, real-time dashboards, and comprehensive analytics to streamline your practice management.

### Key Features

- **Automated ID Generation**: Enquiry IDs (ENQ-0001) and Matter Codes (MAT-2025-001) are generated automatically
- **40+ Data Fields**: Comprehensive tracking of client details, service requests, and progress
- **Real-time Dashboards**: Status Tracker, KPI Dashboard, and Pipeline Forecast
- **Payment Management**: Track payment milestones for converted clients
- **Multi-user Access**: Role-based permissions for team collaboration
- **Color-coded Status**: Visual indicators for quick status identification

## Getting Started

### Accessing the System

1. Navigate to your CRM system URL
2. Click "Sign In" or "Go to Dashboard"
3. Log in with your Manus account credentials
4. You'll be directed to the Enquiry Log dashboard

### Navigation

The system uses a sidebar navigation menu with the following sections:

- **Enquiry Log**: View and manage all enquiries
- **Status Tracker**: Monitor enquiry distribution by status
- **KPI Dashboard**: View key performance metrics
- **Payment Tracker**: Manage payments for converted clients
- **Pipeline Forecast**: View weighted revenue projections

## Enquiry Management

### Creating a New Enquiry

1. Click "New Enquiry" button in the Enquiry Log
2. Fill in the required fields:
   - **Date of Enquiry** (required)
   - **Client Name** (required)
3. Complete additional sections as needed:
   - Basic Information
   - Client Details
   - Service Details
   - Assignment & Status
4. Click "Create Enquiry"

**Note**: The Enquiry ID is automatically generated when you create an enquiry.

### Editing an Enquiry

1. Navigate to the Enquiry Log
2. Click the eye icon next to the enquiry you want to edit
3. Update the fields as needed
4. Click "Update Enquiry" to save changes

### Converting an Enquiry

When a client decides to proceed:

1. Open the enquiry for editing
2. Scroll to "Progress Tracking" section
3. Enter the **Conversion Date**
4. Change **Current Status** to "Converted"
5. Click "Update Enquiry"

**Note**: A Matter Code (e.g., MAT-2025-001) is automatically generated when you set the conversion date.

### Enquiry Fields Reference

#### Basic Information
- Date of Enquiry, Time, Communication Channel, Received By

#### Client Details
- Client Name, Client Type, Nationality, Email, Phone Number
- Preferred Contact Method, Language Preference

#### Service Details
- Service Requested, Short Description, Urgency Level
- Client Budget, Potential Value Range, Expected Timeline

#### Assignment & Status
- Assigned Department, Suggested Lead Lawyer
- Current Status, Next Action, Deadline

#### Progress Tracking (for existing enquiries)
- First Response Date, Meeting Date, Proposal Sent Date
- Proposal Value, Follow-up Count, Last Contact Date
- Conversion Date, Engagement Letter Date

#### Additional Information
- Referral Source Name, Competitor Involvement
- Internal Notes

## Dashboards

### Status Tracker

The Status Tracker provides a visual overview of enquiry distribution:

- **Summary Cards**: Total, Active, Converted, and Lost enquiries
- **Status Breakdown**: Progress bars showing percentage and count for each status
- **Color Coding**:
  - Gray: Pending
  - Blue: Contacted
  - Purple: Meeting Scheduled
  - Yellow: Proposal Sent
  - Green: Converted
  - Red: Declined
  - Orange: Conflict

### KPI Dashboard

View key performance indicators:

- **Total Enquiries**: All-time enquiry count
- **This Month**: Current month enquiries
- **Converted**: Successfully closed enquiries
- **Conversion Rate**: Success rate percentage
- **Total Revenue**: Revenue from converted enquiries
- **Average Value**: Average revenue per conversion

### Pipeline Forecast

Weighted revenue projections based on status probability:

- **Total Pipeline Value**: Sum of all proposal values
- **Weighted Forecast**: Expected revenue based on probability
- **Probability Weights**:
  - Pending: 10%
  - Contacted: 20%
  - Meeting Scheduled: 40%
  - Proposal Sent: 60%
  - Converted: 100%

**Use Case**: Use this forecast to plan resource allocation and set revenue targets.

## Payment Tracking

### Setting Up Payment Records

1. Navigate to Payment Tracker
2. Find the converted enquiry in the table
3. Click "Set Up" button
4. Enter payment details:
   - Payment Status
   - Total Amount
   - Amount Paid
   - Payment Milestones (Retainer, Mid-payment, Final)
5. Click "Save Payment"

### Payment Milestones

Track three payment stages:

1. **Retainer**: Initial payment to secure services
2. **Mid-payment**: Interim payment during work progress
3. **Final Payment**: Completion payment

For each milestone, record:
- Amount
- Payment Date

### Payment Status Options

- **Not Started**: No payments received yet
- **Retainer Paid**: Initial retainer received
- **Partially Paid**: Some payments received
- **Fully Paid**: All payments completed
- **Overdue**: Payment past due date

## User Roles

The system supports two user roles:

### Admin
- Full access to all features
- Can create, edit, and delete enquiries
- Can manage payment records
- Can view all dashboards

### User
- Can view and create enquiries
- Can edit enquiries they created
- Can view dashboards
- Limited access to sensitive operations

**Note**: The system owner is automatically assigned the Admin role.

## Best Practices

### Data Entry

1. **Be Consistent**: Use the dropdown menus to ensure consistent data entry
2. **Update Regularly**: Keep enquiry status and follow-up counts current
3. **Add Notes**: Use internal notes to document important conversations
4. **Set Deadlines**: Always set deadlines for next actions

### Status Management

1. **Update Promptly**: Change status as soon as an action is completed
2. **Track Follow-ups**: Increment follow-up count with each contact
3. **Document Reasons**: If an enquiry is declined, document the reason

### Payment Tracking

1. **Set Up Early**: Create payment records immediately after conversion
2. **Update Amounts**: Keep amount paid and outstanding current
3. **Record Dates**: Always record actual payment dates
4. **Add Notes**: Document any payment terms or special arrangements

### Using Dashboards

1. **Daily Check**: Review Status Tracker daily for overdue items
2. **Weekly Review**: Check KPI Dashboard weekly for performance trends
3. **Monthly Planning**: Use Pipeline Forecast for monthly revenue planning
4. **Identify Bottlenecks**: Look for statuses with high counts and low conversion

### Team Collaboration

1. **Assign Clearly**: Always assign a lead lawyer to each enquiry
2. **Update Status**: Keep team informed by updating status promptly
3. **Use Notes**: Share important information through internal notes
4. **Regular Reviews**: Hold team meetings to review pipeline

## Frequently Asked Questions

### Q: Can I change an Enquiry ID?
**A**: No, Enquiry IDs are automatically generated and cannot be changed to maintain data integrity.

### Q: What happens if I delete an enquiry?
**A**: Deleted enquiries are permanently removed from the system. Use "Declined" or "Not Pursued" status instead if you want to keep the record.

### Q: Can I export data to Excel?
**A**: The system is web-based and designed to replace Excel. All data is accessible through the dashboards and enquiry list.

### Q: How do I add more users?
**A**: Users are added through the Manus authentication system. Share the application URL with team members who have Manus accounts.

### Q: What if two enquiries have the same client?
**A**: Create separate enquiry records for each matter. Use the client name consistently and link them through internal notes if needed.

### Q: Can I customize the dropdown options?
**A**: The dropdown options are pre-configured based on common legal practice needs. Contact your system administrator for customization requests.

## Support

For technical support or feature requests, please contact your system administrator or visit the Manus support portal.

---

**Version**: 1.0  
**Last Updated**: December 2025
