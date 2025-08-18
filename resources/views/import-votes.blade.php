<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Import Vote Tables</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;padding:24px}</style>
</head>
<body>
    <h1>Import Vote Tables (PDF)</h1>
    <form action="{{ route('votes.import.store') }}" method="post" enctype="multipart/form-data">
        @csrf
        <div>
            <label>PDF file</label>
            <input type="file" name="pdf" accept="application/pdf" required>
        </div>
        <div style="margin-top:8px">
            <label>Pages (optional)</label>
            <input type="text" name="pages" placeholder="all, 1, 1-3, 1,3,5">
        </div>
        <div style="margin-top:8px">
            <label>Mode</label>
            <select name="mode">
                <option value="lattice" selected>lattice (ruled tables)</option>
                <option value="stream">stream (no lines)</option>
            </select>
        </div>
        <div style="margin-top:12px">
            <button type="submit">Extract</button>
        </div>
    </form>
</body>
</html>