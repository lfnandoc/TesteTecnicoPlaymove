namespace TesteTecnicoPlaymove.Infra
{
    [System.AttributeUsage(System.AttributeTargets.Property)]
    public class Column : System.Attribute
    {
        public string ColumnName;

        public Column(string columnName)
        {
            ColumnName = columnName;
        }
    }
}
