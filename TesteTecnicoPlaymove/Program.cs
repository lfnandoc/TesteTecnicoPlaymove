using TesteTecnicoPlaymove.Infra;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddSwaggerGen();

AppConfiguration.ConnectionString = builder.Configuration.GetValue<string>("ConnectionString");

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.Urls.Add($"http://*:5050");
}

if (app.Environment.IsProduction())
{
    var port = Environment.GetEnvironmentVariable("PORT");
    app.Urls.Add($"http://*:{port}");
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
