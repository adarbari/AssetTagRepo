// import React from &apos;react&apos;;
import { render, screen } from &apos;@testing-library/react&apos;;
import { describe, it, expect, vi } from &apos;vitest&apos;;
import { AuditLogList, type AuditLogEntry } from &apos;../common/AuditLogList&apos;;

describe(&apos;AuditLogList Component&apos;, () => {
  const mockEntries: AuditLogEntry[] = [
    {
      id: &apos;1&apos;,
      timestamp: &apos;2023-10-27T10:00:00Z&apos;,
      action: &apos;created&apos;,
      field: &apos;status&apos;,
      oldValue: &apos;&apos;,
      newValue: &apos;active&apos;,
      changedBy: &apos;John Doe&apos;,
      notes: &apos;Initial creation&apos;,
    },
    {
      id: &apos;2&apos;,
      timestamp: &apos;2023-10-27T11:00:00Z&apos;,
      action: &apos;updated&apos;,
      field: &apos;priority&apos;,
      oldValue: &apos;low&apos;,
      newValue: &apos;high&apos;,
      changedBy: &apos;Jane Smith&apos;,
      changes: [
        { field: &apos;priority&apos;, from: &apos;low&apos;, to: &apos;high&apos; },
        { field: &apos;status&apos;, from: &apos;active&apos;, to: &apos;in-progress&apos; },
      ],
    },
  ];

  describe(&apos;Empty State&apos;, () => {
    it(&apos;should render empty state when no entries provided&apos;, () => {
      render(<AuditLogList entries={[]} />);

      expect(screen.getByText(&apos;Audit Log&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Complete history of all changes&apos;)
      ).toBeInTheDocument();
      expect(screen.getByText(&apos;No Audit Log Entries&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(/No changes have been recorded yet/)
      ).toBeInTheDocument();
    });

    it(&apos;should render custom empty message&apos;, () => {
      render(
        <AuditLogList entries={[]} emptyMessage=&apos;No changes recorded yet.&apos; />
      );

      expect(
        screen.getByText(/No changes have been recorded yet/)
      ).toBeInTheDocument();
    });

    it(&apos;should render custom title and description&apos;, () => {
      render(
        <AuditLogList
          entries={[]}
          title=&apos;Change History&apos;
          description=&apos;Track all modifications&apos;
        />
      );

      expect(screen.getByText(&apos;Change History&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Track all modifications&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Default Variant (Card-based)&apos;, () => {
    it(&apos;should render entries in card format&apos;, () => {
      render(<AuditLogList entries={mockEntries} />);

      expect(screen.getByText(&apos;Audit Log&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Complete history of all changes&apos;)
      ).toBeInTheDocument();
      expect(screen.getByText(&apos;John Doe&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Jane Smith&apos;)).toBeInTheDocument();
    });

    it(&apos;should display entry details correctly&apos;, () => {
      render(<AuditLogList entries={[mockEntries[0]]} />);

      expect(screen.getByText(&apos;John Doe&apos;)).toBeInTheDocument();
      expect(screen.getByText(/Created status/)).toBeInTheDocument();
      expect(screen.getByText(/Created status/)).toBeInTheDocument();
    });

    it(&apos;should display timestamp with default formatter&apos;, () => {
      render(<AuditLogList entries={[mockEntries[0]]} />);

      // Should display formatted timestamp
      expect(screen.getByText(/10\/27\/2023/)).toBeInTheDocument();
    });

    it(&apos;should use custom date formatter&apos;, () => {
      const customFormatter = vi.fn().mockReturnValue(&apos;Custom Date Format&apos;);
      render(
        <AuditLogList entries={[mockEntries[0]]} formatDate={customFormatter} />
      );

      expect(customFormatter).toHaveBeenCalledWith(&apos;2023-10-27T10:00:00Z&apos;);
      expect(screen.getByText(&apos;Custom Date Format&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Dialog Variant (Timeline)&apos;, () => {
    it(&apos;should render entries in timeline format&apos;, () => {
      render(<AuditLogList entries={mockEntries} variant=&apos;dialog&apos; />);

      expect(screen.getByText(&apos;created&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;updated&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;John Doe&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Jane Smith&apos;)).toBeInTheDocument();
    });

    it(&apos;should display action badges in timeline&apos;, () => {
      render(<AuditLogList entries={[mockEntries[0]]} variant=&apos;dialog&apos; />);

      const badge = screen.getByText(&apos;created&apos;);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(&apos;bg-primary/10&apos;);
    });

    it(&apos;should display changes in timeline format&apos;, () => {
      render(<AuditLogList entries={[mockEntries[1]]} variant=&apos;dialog&apos; />);

      expect(screen.getAllByText(&apos;priority:&apos;)).toHaveLength(2); // One from changes array, one from oldValue/newValue
      expect(screen.getAllByText(&apos;low&apos;)).toHaveLength(2); // Both from changes array and oldValue/newValue
      expect(screen.getAllByText(&apos;high&apos;)).toHaveLength(2); // Both from changes array and oldValue/newValue
      expect(screen.getByText(&apos;status:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;active&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;in-progress&apos;)).toBeInTheDocument();
    });

    it(&apos;should display notes in timeline format&apos;, () => {
      render(<AuditLogList entries={[mockEntries[0]]} variant=&apos;dialog&apos; />);

      expect(screen.getByText(&apos;Initial creation&apos;)).toBeInTheDocument();
    });

    it(&apos;should render timeline dots and separators&apos;, () => {
      render(<AuditLogList entries={mockEntries} variant=&apos;dialog&apos; />);

      // Should have timeline dots (bg-primary rounded-full)
      const dots = document.querySelectorAll(&apos;.bg-primary.rounded-full&apos;);
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  describe(&apos;Entry Data Handling&apos;, () => {
    it(&apos;should handle entries without changes array&apos;, () => {
      const entryWithoutChanges: AuditLogEntry = {
        id: &apos;3&apos;,
        timestamp: &apos;2023-10-27T12:00:00Z&apos;,
        action: &apos;deleted&apos;,
        changedBy: &apos;Admin User&apos;,
      };

      render(<AuditLogList entries={[entryWithoutChanges]} variant=&apos;dialog&apos; />);

      expect(screen.getByText(&apos;deleted&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Admin User&apos;)).toBeInTheDocument();
    });

    it(&apos;should handle entries without notes&apos;, () => {
      const entryWithoutNotes: AuditLogEntry = {
        id: &apos;4&apos;,
        timestamp: &apos;2023-10-27T13:00:00Z&apos;,
        action: &apos;updated&apos;,
        field: &apos;name&apos;,
        oldValue: &apos;Old Name&apos;,
        newValue: &apos;New Name&apos;,
        changedBy: &apos;User&apos;,
      };

      render(<AuditLogList entries={[entryWithoutNotes]} />);

      expect(screen.getByText(&apos;User&apos;)).toBeInTheDocument();
      expect(screen.getByText(/Updated name/)).toBeInTheDocument();
    });

    it(&apos;should handle entries with only changes array&apos;, () => {
      const entryWithOnlyChanges: AuditLogEntry = {
        id: &apos;5&apos;,
        timestamp: &apos;2023-10-27T14:00:00Z&apos;,
        action: &apos;bulk_update&apos;,
        changedBy: &apos;System&apos;,
        changes: [
          { field: &apos;field1&apos;, from: &apos;old1&apos;, to: &apos;new1&apos; },
          { field: &apos;field2&apos;, from: &apos;old2&apos;, to: &apos;new2&apos; },
        ],
      };

      render(
        <AuditLogList entries={[entryWithOnlyChanges]} variant=&apos;dialog&apos; />
      );

      expect(screen.getByText(&apos;bulk_update&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;field1:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;field2:&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper heading structure&apos;, () => {
      render(<AuditLogList entries={mockEntries} />);

      const heading = screen.getByRole(&apos;heading&apos;, { name: &apos;Audit Log&apos; });
      expect(heading).toBeInTheDocument();
    });

    it(&apos;should have proper list structure in timeline variant&apos;, () => {
      render(<AuditLogList entries={mockEntries} variant=&apos;timeline&apos; />);

      // Timeline should be accessible
      expect(screen.getByText(&apos;John Doe&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Jane Smith&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Custom Props&apos;, () => {
    it(&apos;should accept custom className&apos;, () => {
      const { container } = render(
        <AuditLogList entries={mockEntries} className=&apos;custom-audit-log&apos; />
      );

      expect(container.firstChild).toHaveClass(&apos;custom-audit-log&apos;);
    });

    it(&apos;should handle custom formatDate function&apos;, () => {
      const formatDate = (dateString: string) => `Custom: ${dateString}`;
      render(
        <AuditLogList entries={[mockEntries[0]]} formatDate={formatDate} />
      );

      expect(
        screen.getByText(&apos;Custom: 2023-10-27T10:00:00Z&apos;)
      ).toBeInTheDocument();
    });
  });
});
