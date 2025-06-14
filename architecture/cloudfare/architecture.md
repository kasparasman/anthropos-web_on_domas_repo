Presigned url can only be used with s3 api domian not custom domain.:
Uploads (PUT/POST) and private downloads (GET/HEAD) that rely on presigned URLs must target the native R2 S3 endpoint.

After the object is written you are free to serve it through any custom-domain (public bucket, Worker, Zero-Trust, etc.); the serving path is an independent request.


Uploads: presigned URL → native R2 S3 host only.

Downloads:

public? serve via custom domain + Cache.

private? Worker or WAF token on custom domain; do not try to presign the custom host.

Don’t worry about leaking the bucket/account in uploads – the URLs are single-use, very short-lived, and cannot be replayed after expiry.

Monitor Class A/B ops; presigned PUTs are Class A, GETs that bypass the cache are Class B.


