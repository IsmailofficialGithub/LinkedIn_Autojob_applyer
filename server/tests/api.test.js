process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const test = require('node:test');
const request = require('supertest');
const app = require('../src/app');
const { resetStore, state } = require('../src/database/store');

const auth = { Authorization: 'Bearer test-token' };

test('protected routes reject missing and invalid tokens', async () => {
  resetStore();

  await request(app).get('/api/me').expect(401);
  await request(app).get('/api/me').set('Authorization', 'Bearer invalid').expect(401);
});

test('all planned backend phases expose working route flows', async () => {
  resetStore();

  const meBefore = await request(app).get('/api/me').set(auth).expect(200);
  assert.equal(meBefore.body.data.user.id, 'user_test');

  const profile = await request(app)
    .post('/api/users/profile')
    .set(auth)
    .send({ fullName: 'Test User', phone: '123', location: 'Remote' })
    .expect(201);
  assert.equal(profile.body.data.fullName, 'Test User');

  const profileUpdate = await request(app)
    .put('/api/users/profile')
    .set(auth)
    .send({ location: 'Lahore' })
    .expect(200);
  assert.equal(profileUpdate.body.data.location, 'Lahore');

  const onboardingBefore = await request(app).get('/api/onboarding').set(auth).expect(200);
  assert.equal(onboardingBefore.body.data.complete, false);

  const connect = await request(app).get('/api/linkedin/connect').set(auth).expect(200);
  assert.match(connect.body.data.url, /linkedin\.com/);

  const linkedin = await request(app)
    .get('/api/linkedin/callback?mock=1&sub=abc&name=Tester&email=linkedin@example.com')
    .set(auth)
    .expect(200);
  assert.equal(linkedin.body.data.connected, true);

  const linkedinStatus = await request(app).get('/api/linkedin/status').set(auth).expect(200);
  assert.equal(linkedinStatus.body.data.connected, true);

  const resume = await request(app)
    .post('/api/resumes')
    .set(auth)
    .attach('resume', Buffer.from('%PDF test'), {
      filename: 'resume.pdf',
      contentType: 'application/pdf',
    })
    .expect(201);
  assert.equal(resume.body.data.active, true);

  await request(app)
    .post('/api/resumes')
    .set(auth)
    .attach('resume', Buffer.from('bad'), {
      filename: 'resume.txt',
      contentType: 'text/plain',
    })
    .expect(400);

  const activeResume = await request(app).get('/api/resumes/active').set(auth).expect(200);
  assert.equal(activeResume.body.data.id, resume.body.data.id);

  const updatedResume = await request(app)
    .put(`/api/resumes/${resume.body.data.id}`)
    .set(auth)
    .send({ originalName: 'updated.pdf' })
    .expect(200);
  assert.equal(updatedResume.body.data.originalName, 'updated.pdf');

  const account = await request(app)
    .post('/api/email-accounts')
    .set(auth)
    .send({ email: 'sender@gmail.com', appPassword: 'secret-app-password' })
    .expect(201);
  assert.equal(account.body.data.hasAppPassword, true);
  assert.equal(account.body.data.encryptedAppPassword, undefined);
  assert.notEqual(state.emailAccounts[0].encryptedAppPassword, 'secret-app-password');

  const accountTest = await request(app)
    .post('/api/email-accounts/test')
    .set(auth)
    .send({ id: account.body.data.id })
    .expect(200);
  assert.equal(accountTest.body.data.smtpStatus, 'verified');

  const accountUpdate = await request(app)
    .put(`/api/email-accounts/${account.body.data.id}`)
    .set(auth)
    .send({ enabled: true })
    .expect(200);
  assert.equal(accountUpdate.body.data.enabled, true);

  const template = await request(app)
    .post('/api/email-templates')
    .set(auth)
    .send({ subject: 'Application', body: 'Hello, please see my resume.' })
    .expect(201);
  assert.equal(template.body.data.active, true);

  const templateUpdate = await request(app)
    .put(`/api/email-templates/${template.body.data.id}`)
    .set(auth)
    .send({ subject: 'Updated application' })
    .expect(200);
  assert.equal(templateUpdate.body.data.subject, 'Updated application');

  const keywordSet = await request(app)
    .post('/api/keyword-sets')
    .set(auth)
    .send({
      keywords: ['nodejs', 'react'],
      filters: { location: 'remote', workMode: 'remote' },
    })
    .expect(201);
  assert.deepEqual(keywordSet.body.data.keywords, ['nodejs', 'react']);

  const keywordUpdate = await request(app)
    .put(`/api/keyword-sets/${keywordSet.body.data.id}`)
    .set(auth)
    .send({ filters: { location: 'US' } })
    .expect(200);
  assert.equal(keywordUpdate.body.data.filters.location, 'US');

  const settings = await request(app)
    .put('/api/automation/settings')
    .set(auth)
    .send({ autoSendEnabled: true, maxEmailsPerDay: 100 })
    .expect(200);
  assert.equal(settings.body.data.autoSendEnabled, true);

  const job = await request(app)
    .post('/api/job-submissions')
    .set(auth)
    .send({
      sourceType: 'linkedin_job',
      url: 'https://www.linkedin.com/jobs/view/123',
      content: 'Hiring Node developer. Email recruiter@example.com',
    })
    .expect(201);
  assert.equal(job.body.data.sourceType, 'linkedin_job');

  const post = await request(app)
    .post('/api/job-submissions')
    .set(auth)
    .send({
      sourceType: 'linkedin_post',
      url: 'https://www.linkedin.com/posts/example',
      content: 'We are hiring. Contact hr@example.com',
    })
    .expect(201);
  assert.equal(post.body.data.sourceType, 'linkedin_post');

  await request(app)
    .post('/api/job-submissions')
    .set(auth)
    .send({
      sourceType: 'linkedin_job',
      url: 'https://example.com/jobs/123',
      content: 'bad',
    })
    .expect(400);

  const duplicate = await request(app)
    .post('/api/job-submissions')
    .set(auth)
    .send({
      sourceType: 'linkedin_job',
      url: 'https://www.linkedin.com/jobs/view/123',
      content: 'Hiring Node developer. Email recruiter@example.com',
    })
    .expect(201);
  assert.equal(duplicate.body.data.id, job.body.data.id);

  const emails = await request(app).get('/api/recruiter-emails').set(auth).expect(200);
  assert.equal(emails.body.data.length, 2);

  const extracted = await request(app)
    .post('/api/recruiter-emails/extract')
    .set(auth)
    .send({ content: 'Extra contact Extra@Example.com' })
    .expect(201);
  assert.equal(extracted.body.data[0].email, 'extra@example.com');

  const emailUpdate = await request(app)
    .put(`/api/recruiter-emails/${emails.body.data[0].id}`)
    .set(auth)
    .send({ email: 'updated@example.com' })
    .expect(200);
  assert.equal(emailUpdate.body.data.email, 'updated@example.com');

  const queueBefore = await request(app).get('/api/email-queue').set(auth).expect(200);
  assert.ok(queueBefore.body.data.length >= 3);

  const queueUpdate = await request(app)
    .put(`/api/email-queue/${queueBefore.body.data[0].id}`)
    .set(auth)
    .send({ subject: 'Manual subject' })
    .expect(200);
  assert.equal(queueUpdate.body.data.subject, 'Manual subject');

  const send = await request(app)
    .post(`/api/email-queue/${queueBefore.body.data[0].id}/send`)
    .set(auth)
    .expect(200);
  assert.equal(send.body.data.status, 'sent');

  const run = await request(app).post('/api/automation/run-now').set(auth).expect(200);
  assert.match(run.body.data.message, /Processed/);

  const logs = await request(app).get('/api/email-send-logs').set(auth).expect(200);
  assert.ok(logs.body.data.length >= 1);

  const runs = await request(app).get('/api/automation/runs').set(auth).expect(200);
  assert.ok(runs.body.data.length >= 1);

  await request(app).delete(`/api/email-queue/${queueBefore.body.data[0].id}`).set(auth).expect(200);
  await request(app).delete(`/api/recruiter-emails/${emails.body.data[1].id}`).set(auth).expect(200);
  await request(app).delete(`/api/job-submissions/${post.body.data.id}`).set(auth).expect(200);
  await request(app).delete(`/api/keyword-sets/${keywordSet.body.data.id}`).set(auth).expect(200);
  await request(app).delete(`/api/email-templates/${template.body.data.id}`).set(auth).expect(200);
  await request(app).delete(`/api/email-accounts/${account.body.data.id}`).set(auth).expect(200);
  await request(app).delete(`/api/resumes/${resume.body.data.id}`).set(auth).expect(200);
  await request(app).delete('/api/linkedin/disconnect').set(auth).expect(200);
  await request(app).delete('/api/users/profile').set(auth).expect(200);
});
