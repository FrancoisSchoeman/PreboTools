import { testGlobalSmtpAction } from '@/actions/leadGen';
import SubmitButton from '@/components/SubmitButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenSmtpServer } from '@/lib/types';

type SearchParams = Promise<{ test?: string }>;

const comingSoonProviders = [
  { name: 'Client SMTP', host: '—', from: '—' },
  { name: 'Office365 SMTP', host: 'smtp.office365.com', from: '—' },
  { name: 'Gmail OAuth', host: '—', from: '—' },
  { name: 'Amazon SES', host: '—', from: '—' },
  { name: 'SendGrid', host: '—', from: '—' },
  { name: 'Mailgun', host: '—', from: '—' },
];

export default async function GlobalSmtpPage(props: {
  searchParams: SearchParams;
}) {
  const { test } = await props.searchParams;

  let smtpServers: LeadGenSmtpServer[] = [];

  try {
    smtpServers = await leadGenFetch<LeadGenSmtpServer[]>('/smtp-servers');
  } catch {
    smtpServers = [];
  }

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage SMTP Servers</h1>
          <p className="text-muted-foreground">
            Prebo SMTP is the default sender for all Lead Gen clients.
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled>+ Add New SMTP</Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Coming Soon</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {test === 'success' && (
        <p className="text-sm text-green-600">SMTP connection test successful.</p>
      )}
      {test === 'error' && (
        <p className="text-sm text-red-600">SMTP connection test failed.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active SMTP Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>From Address</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {smtpServers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">
                    {server.name}
                    {server.is_default && (
                      <Badge className="ml-2" variant="secondary">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{server.host}</TableCell>
                  <TableCell>{server.from_email}</TableCell>
                  <TableCell>{server.client_count}</TableCell>
                  <TableCell>
                    {server.status_ok ? (
                      <Badge>Connected</Badge>
                    ) : (
                      <Badge variant="destructive">{server.status_detail}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <form action={testGlobalSmtpAction}>
                      <SubmitButton submitText="Testing">Test</SubmitButton>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>From Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comingSoonProviders.map((provider) => (
                <TableRow key={provider.name}>
                  <TableCell>{provider.name}</TableCell>
                  <TableCell>{provider.host}</TableCell>
                  <TableCell>{provider.from}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';
